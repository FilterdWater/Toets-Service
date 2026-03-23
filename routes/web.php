<?php

use App\Http\Controllers\ExamController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('root');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::prefix('exams')->group(function () {
        Route::get('/{id}', [ExamController::class, 'show'])->name('exam');
    });
});

require __DIR__.'/settings.php';
