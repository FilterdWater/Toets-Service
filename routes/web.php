<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('root');

Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::inertia('/student', 'student')->name('student');
});

Route::middleware(['auth', 'verified', 'role:teacher'])->group(function () {
    Route::inertia('/teacher', 'teacher')->name('teacher');
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::inertia('/admin', 'admin')->name('admin');
});

require __DIR__.'/settings.php';
