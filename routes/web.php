<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('root');

Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::inertia('/student/dashboard', 'dashboard')->name('dashboard');
});
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::inertia('/admin/dashboard', 'dashboard2')->name('dashboard2');
});

require __DIR__.'/settings.php';
