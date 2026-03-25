<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'active_from', 'active_until', 'globally_available', 'max_mistakes', 'created_at', 'updated_at'];

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'groups_has_exams');
    }
}
