<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'description',
        'active_from',
        'active_until',
        'globally_available',
        'max_mistakes',
        'created_at',
        'updated_at',
        'sequence_nr',
        'new_page',
    ];

    protected $casts = [
        'active_from' => 'datetime',
        'active_until' => 'datetime',
        'globally_available' => 'boolean',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_has_exams');
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'groups_has_exams');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}
