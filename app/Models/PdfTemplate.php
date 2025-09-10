<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PdfTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'original_filename',
        'pdf_path',
        'fields_config',
        'is_active',
        'metadata'
    ];

    protected $casts = [
        'fields_config' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the template.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the generated PDFs for this template.
     */
    public function generatedPdfs()
    {
        return $this->hasMany(GeneratedPdf::class);
    }

    /**
     * Scope a query to only include active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the template's PDF URL.
     */
    public function getPdfUrlAttribute()
    {
        if ($this->pdf_path) {
            $storageDisk = config('filesystems.pdf_disk', 'public');
            
            // For local storage, use asset URL
            if ($storageDisk === 'public') {
                // Make sure the URL is properly formatted with the correct domain and absolute path
                $url = url('storage/' . $this->pdf_path);
                
                // Log the generated URL for debugging
                \Log::debug('Generated PDF URL: ' . $url);
                
                return $url;
            }
            
            // For S3, use the standard URL method
            return \Storage::disk($storageDisk)->url($this->pdf_path);
        }
        return null;
    }

    /**
     * Get the number of fields in this template.
     */
    public function getFieldsCountAttribute()
    {
        return $this->fields_config ? count($this->fields_config) : 0;
    }
} 