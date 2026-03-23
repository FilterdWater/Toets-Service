<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function show(Request $request, $examId)
    {
        $exam = Exam::where('id', $examId)->firstOrFail();

        return Inertia::render('ExamPage/ExamPage', [
            'exam' => $exam,
        ]);
    }
}
