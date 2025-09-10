<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeneratedPdf extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pdf_template_id',
        'filename',
        'pdf_path',
        'data_used',
        'status',
        'file_size',
        'metadata'
    ];

    protected $casts = [
        'data_used' => 'array',
        'metadata' => 'array',
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';

    /**
     * Get the user that owns the generated PDF.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the template used for this generated PDF.
     */
    public function pdfTemplate()
    {
        return $this->belongsTo(PdfTemplate::class);
    }

    /**
     * Get the generated PDF's download URL.
     */
    public function getDownloadUrlAttribute()
    {
        if ($this->pdf_path && $this->status === self::STATUS_COMPLETED) {
            $storageDisk = config('filesystems.pdf_disk', 'public');
            
            // For local storage, use asset URL
            if ($storageDisk === 'public') {
                return url('storage/' . $this->pdf_path);
            }
            
            // For S3, use the temporary URL method
            return \Storage::disk($storageDisk)->temporaryUrl(
                $this->pdf_path,
                now()->addHours(24)
            );
        }
        return null;
    }

    /**
     * Scope a query to only include completed PDFs.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Get human readable file size.
     */
    public function getFileSizeHumanAttribute()
    {
        if (!$this->file_size) return null;
        
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unitIndex = 0;
        
        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }
        
        return round($size, 2) . ' ' . $units[$unitIndex];
    }
} 