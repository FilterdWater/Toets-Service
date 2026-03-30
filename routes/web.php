<?php

use App\Enums\Role;
use App\Http\Controllers\ApplicationStatisticsController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\TakeExamController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('root');

Route::middleware(['auth', 'verified', 'is_active'])->group(function () {
    Route::get('dashboard', function () {
        $role = Auth::user()->role;

        if ($role instanceof Role) {
            $role = $role->value;
        }

        return match ($role) {
            'student' => redirect()->route('student'),
            'teacher' => redirect()->route('teacher'),
            'admin' => redirect()->route('admin'),
            default => redirect()->route('login'),
        };
    })->name('dashboard');

    Route::middleware(['role:student,teacher,admin'])->group(function () {
    Route::prefix('student')->group(function () {
        Route::get('/', [TakeExamController::class, 'index'])->name('student');
        Route::get('/toets/{id}', [TakeExamController::class, 'makeExam'])->name('makeExam');
        Route::post('/toets/{id}/start', [TakeExamController::class, 'startExam'])->name('startExam');
    });    });

    Route::middleware(['role:teacher,admin'])->group(function () {
        Route::prefix('docent')->group(function () {
            /*
            * Groups
            */
            Route::inertia('/', 'teacher')->name('teacher');
            Route::get('groepen', [GroupController::class, 'index'])->name('groups');
            Route::post('groepen', [GroupController::class, 'store'])->name('storeGroup');
            Route::put('groepen/{id}', [GroupController::class, 'update'])->name('updateGroup');
            Route::delete('groepen/{id}', [GroupController::class, 'destroy'])->name('destroyGroup');
            Route::post('groepen/{id}/student', [GroupController::class, 'attachUser'])->name('attachUser');
            Route::post('groepen/{id}/examen', [GroupController::class, 'attachExam'])->name('attachExam');
            Route::delete('/groepen/{group}/studenten/{user}', [GroupController::class, 'detachUser'])->name('detachUser');
            Route::delete('/groepen/{group}/examen/{exam}', [GroupController::class, 'detachExam'])->name('detachExam');

            /*
             * Exams
             */
            Route::prefix('toetsen')->group(function () {
                Route::get('/', [ExamController::class, 'index'])->name('exams');
                Route::get('/{id}/wijzigen', [ExamController::class, 'showEdit'])->name('getExam');
                Route::get('/aanmaken', [ExamController::class, 'showCreate'])->name('createExam');
                Route::post('/opslaan', [ExamController::class, 'store'])->name('storeExam');
                Route::put('/{exam}', [ExamController::class, 'update'])->name('updateExam');
                Route::delete('/{exam}', [ExamController::class, 'destroy'])->name('deleteExam');
            });
        });
    });

    Route::middleware(['role:admin'])->group(function () {
        Route::inertia('beheerder', 'admin/admin')->name('admin');
        Route::get('accounts', [UserController::class, 'index'])->name('accounts');
        Route::get('accounts/aanmaken', [UserController::class, 'showCreate'])->name('accountCreate');
        Route::post('accounts/opslaan', [UserController::class, 'store'])->name('accountStore');
        Route::post('accounts/importeren', [UserController::class, 'import'])->name('accountImport');
        Route::get('accounts/{id}/bewerken', [UserController::class, 'showEdit'])->name('accountEdit');
        Route::put('accounts/{id}/bijwerken', [UserController::class, 'update'])->name('accountUpdate');
        Route::put('accounts/{id}/wachtwoord-resetten', [UserController::class, 'resetPassword'])->name('accountResetPassword');

        /*
        * Application statistics
        */
        Route::prefix('applicatie-statistieken')->group(function () {
            Route::get('/', [ApplicationStatisticsController::class, 'index'])->name('applicationStatistics');
        });
        Route::put('accounts/{id}/actief-aanpassen', [UserController::class, 'updateIsActive'])->name('accountUpdateIsActive');
    });
});

require __DIR__.'/settings.php';
