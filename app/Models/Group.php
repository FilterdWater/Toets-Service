<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'groups_has_users');
    }

    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'groups_has_exams');
    }
}
