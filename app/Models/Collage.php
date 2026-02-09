<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Collage extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'main_image',
        'photos',
        'photo_count',
    ];

    protected function casts(): array
    {
        return [
            'photos' => 'array',
        ];
    }
}
