<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(): Response
    {
        $exams = Exam::with('groups')
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return Inertia::render('exams', [
            'exams' => $exams,
        ]);
    }
}
