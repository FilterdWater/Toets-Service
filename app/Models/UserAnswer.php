<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAnswer extends Model
{
    use HasFactory;

    protected $fillable = ['submission_id', 'question_id', 'selected_answer', 'text_answer', 'created_at', 'updated_at'];

    protected $casts = [
        'selected_answer' => 'array',
    ];
}
