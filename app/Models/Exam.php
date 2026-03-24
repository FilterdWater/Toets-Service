<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = [
        'name',
        'description',
        'active_from',
        'active_until',
        'globally_available',
        'max_mistakes',
    ];

    protected $casts = [
        'active_from' => 'datetime',
        'active_until' => 'datetime',
        'globally_available' => 'boolean',
    ];
}
