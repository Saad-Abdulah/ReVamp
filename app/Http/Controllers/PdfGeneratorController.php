<?php

namespace App\Http\Controllers;

use App\Models\PdfTemplate;
use App\Models\GeneratedPdf;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Process;

class PdfGeneratorController extends Controller
{
    /**
     * Generate a PDF from a template with provided data.
     */
    public function generate(Request $request, PdfTemplate $template): JsonResponse
    {
        // Ensure the template belongs to the authenticated user
        if ($template->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        $request->validate([
            'data' => 'required|array',
            'filename' => 'nullable|string|max:255',
        ]);

        // Validate that all required fields are provided
        $fieldsConfig = $template->fields_config ?? [];
        $providedData = $request->data;
        
        $missingFields = [];
        foreach ($fieldsConfig as $field) {
            $fieldName = $field['name'] ?? null;
            if ($fieldName && !isset($providedData[$fieldName])) {
                $missingFields[] = $fieldName;
            }
        }

        if (!empty($missingFields)) {
            return response()->json([
                'message' => 'Missing required fields',
                'missing_fields' => $missingFields
            ], 422);
        }

        // Create a record for the generated PDF
        $filename = $request->filename ?? 'generated_' . time() . '.pdf';
        if (!str_ends_with($filename, '.pdf')) {
            $filename .= '.pdf';
        }

        $generatedPdf = GeneratedPdf::create([
            'user_id' => $request->user()->id,
            'pdf_template_id' => $template->id,
            'filename' => $filename,
            'data_used' => $providedData,
            'status' => GeneratedPdf::STATUS_PROCESSING,
        ]);

        try {
            // Prepare data for Node.js script
            $nodeScriptData = [
                'templateUrl' => $template->pdf_url,
                'fieldsConfig' => $fieldsConfig,
                'data' => $providedData,
                'outputPath' => storage_path('app/temp/' . $generatedPdf->id . '_' . $filename),
            ];

            // Ensure temp directory exists
            $tempDir = storage_path('app/temp');
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // Write the configuration to a temporary file
            $configFile = storage_path('app/temp/config_' . $generatedPdf->id . '.json');
            file_put_contents($configFile, json_encode($nodeScriptData));

            // Run the Node.js PDF generation script
            $nodeScript = base_path('resources/js/pdf-generator.js');
            $nodePath = env('NODE_PATH', 'node');
            $result = Process::run("{$nodePath} {$nodeScript} {$configFile}");

            if ($result->failed()) {
                throw new \Exception('PDF generation failed: ' . $result->errorOutput());
            }

            // Upload the generated PDF to storage
            $generatedPath = $nodeScriptData['outputPath'];
            if (!file_exists($generatedPath)) {
                throw new \Exception('Generated PDF file not found');
            }

            // Use local storage for testing
            $storageDisk = config('filesystems.pdf_disk', 'public');
            $s3Path = 'generated/' . $request->user()->id . '/' . $generatedPdf->id . '_' . $filename;
            
            $uploadedPath = Storage::disk($storageDisk)
                ->putFileAs(
                    'generated/' . $request->user()->id,
                    $generatedPath,
                    $generatedPdf->id . '_' . $filename
                );

            // Update the generated PDF record
            $generatedPdf->update([
                'pdf_path' => $uploadedPath,
                'status' => GeneratedPdf::STATUS_COMPLETED,
                'file_size' => filesize($generatedPath),
                'metadata' => [
                    'generated_at' => now()->toISOString(),
                    'processing_time' => $result->output(),
                ]
            ]);

            // Clean up temporary files
            unlink($generatedPath);
            unlink($configFile);

            return response()->json([
                'generated_pdf' => [
                    'id' => $generatedPdf->id,
                    'filename' => $generatedPdf->filename,
                    'download_url' => $generatedPdf->download_url,
                    'file_size' => $generatedPdf->file_size_human,
                    'status' => $generatedPdf->status,
                    'created_at' => $generatedPdf->created_at,
                ]
            ], 201);

        } catch (\Exception $e) {
            // Update status to failed
            $generatedPdf->update([
                'status' => GeneratedPdf::STATUS_FAILED,
                'metadata' => [
                    'error' => $e->getMessage(),
                    'failed_at' => now()->toISOString(),
                ]
            ]);

            return response()->json([
                'message' => 'PDF generation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the list of generated PDFs for the user.
     */
    public function index(Request $request): JsonResponse
    {
        $generatedPdfs = $request->user()
            ->generatedPdfs()
            ->with('pdfTemplate:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $data = $generatedPdfs->items();
        $formattedData = collect($data)->map(function ($pdf) {
            return [
                'id' => $pdf->id,
                'filename' => $pdf->filename,
                'template_name' => $pdf->pdfTemplate->name ?? 'Unknown',
                'download_url' => $pdf->download_url,
                'file_size' => $pdf->file_size_human,
                'status' => $pdf->status,
                'created_at' => $pdf->created_at,
            ];
        });

        return response()->json([
            'generated_pdfs' => $formattedData,
            'pagination' => [
                'current_page' => $generatedPdfs->currentPage(),
                'last_page' => $generatedPdfs->lastPage(),
                'per_page' => $generatedPdfs->perPage(),
                'total' => $generatedPdfs->total(),
            ]
        ]);
    }

    /**
     * Download a generated PDF.
     */
    public function download(Request $request, GeneratedPdf $generatedPdf): JsonResponse
    {
        // Ensure the PDF belongs to the authenticated user
        if ($generatedPdf->user_id !== $request->user()->id) {
            return response()->json(['message' => 'PDF not found'], 404);
        }

        if ($generatedPdf->status !== GeneratedPdf::STATUS_COMPLETED) {
            return response()->json(['message' => 'PDF not ready for download'], 400);
        }

        return response()->json([
            'download_url' => $generatedPdf->download_url,
            'filename' => $generatedPdf->filename,
        ]);
    }

    /**
     * Delete a generated PDF.
     */
    public function destroy(Request $request, GeneratedPdf $generatedPdf): JsonResponse
    {
        // Ensure the PDF belongs to the authenticated user
        if ($generatedPdf->user_id !== $request->user()->id) {
            return response()->json(['message' => 'PDF not found'], 404);
        }

        // Delete from storage if exists
        if ($generatedPdf->pdf_path) {
            $storageDisk = config('filesystems.pdf_disk', 'public');
            Storage::disk($storageDisk)->delete($generatedPdf->pdf_path);
        }

        // Delete the record
        $generatedPdf->delete();

        return response()->json([
            'message' => 'Generated PDF deleted successfully'
        ]);
    }
} 