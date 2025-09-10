<?php

namespace App\Http\Controllers;

use App\Models\PdfTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PdfTemplateController extends Controller
{
    /**
     * Display a listing of the user's templates.
     */
    public function index(Request $request): JsonResponse
    {
        $templates = $request->user()
            ->pdfTemplates()
            ->active()
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($template) {
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'description' => $template->description,
                    'original_filename' => $template->original_filename,
                    'fields_count' => $template->fields_count,
                    'pdf_url' => $template->pdf_url,
                    'created_at' => $template->created_at,
                    'updated_at' => $template->updated_at,
                ];
            });

        return response()->json([
            'templates' => $templates
        ]);
    }

    /**
     * Store a newly uploaded PDF template.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'pdf_file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $file = $request->file('pdf_file');
        $filename = Str::uuid() . '.pdf';
        $path = 'templates/' . $request->user()->id . '/' . $filename;

        // Use local storage for testing
        $storageDisk = config('filesystems.pdf_disk', 'public');
        
        // Ensure the user directory exists
        $userDir = 'templates/' . $request->user()->id;
        if (!Storage::disk($storageDisk)->exists($userDir)) {
            Storage::disk($storageDisk)->makeDirectory($userDir);
        }
        
        // Upload to storage
        $uploadedPath = Storage::disk($storageDisk)
            ->putFileAs('templates/' . $request->user()->id, $file, $filename);

        $template = PdfTemplate::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'description' => $request->description,
            'original_filename' => $file->getClientOriginalName(),
            'pdf_path' => $uploadedPath,
            'is_active' => true,
            'metadata' => [
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'uploaded_at' => now()->toISOString(),
            ]
        ]);

        return response()->json([
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'original_filename' => $template->original_filename,
                'pdf_url' => $template->pdf_url,
                'fields_count' => 0,
                'created_at' => $template->created_at,
                'updated_at' => $template->updated_at,
            ]
        ], 201);
    }

    /**
     * Display the specified template.
     */
    public function show(Request $request, PdfTemplate $template): JsonResponse
    {
        // Ensure the template belongs to the authenticated user
        if ($template->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        return response()->json([
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'original_filename' => $template->original_filename,
                'pdf_url' => $template->pdf_url,
                'fields_config' => $template->fields_config,
                'fields_count' => $template->fields_count,
                'metadata' => $template->metadata,
                'created_at' => $template->created_at,
                'updated_at' => $template->updated_at,
            ]
        ]);
    }

    /**
     * Update the template's field configuration.
     */
    public function updateFields(Request $request, PdfTemplate $template): JsonResponse
    {
        // Ensure the template belongs to the authenticated user
        if ($template->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        $request->validate([
            'fields_config' => 'required|array',
            'fields_config.*.name' => 'required|string',
            'fields_config.*.type' => 'required|string|in:text,multilineText,check,radioGroup,select,signature,image,dateTime',
            'fields_config.*.position' => 'required|array',
            'fields_config.*.position.x' => 'required|numeric',
            'fields_config.*.position.y' => 'required|numeric',
            'fields_config.*.width' => 'required|numeric',
            'fields_config.*.height' => 'required|numeric',
        ]);

        $template->update([
            'fields_config' => $request->fields_config,
        ]);

        return response()->json([
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'fields_config' => $template->fields_config,
                'fields_count' => $template->fields_count,
                'updated_at' => $template->updated_at,
            ]
        ]);
    }

    /**
     * Update the template's metadata.
     */
    public function update(Request $request, PdfTemplate $template): JsonResponse
    {
        // Ensure the template belongs to the authenticated user
        if ($template->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
        ]);

        $template->update($request->only(['name', 'description', 'is_active']));

        return response()->json([
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'is_active' => $template->is_active,
                'updated_at' => $template->updated_at,
            ]
        ]);
    }

    /**
     * Remove the specified template.
     */
    public function destroy(Request $request, PdfTemplate $template): JsonResponse
    {
        // Ensure the template belongs to the authenticated user
        if ($template->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Template not found'], 404);
        }

        // Soft delete the template
        $template->delete();

        return response()->json([
            'message' => 'Template deleted successfully'
        ]);
    }
} 