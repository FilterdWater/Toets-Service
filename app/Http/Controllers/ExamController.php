<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    // the edit function is at the same time also the show method for the admin and teacher
    public function edit(Request $request, $examId)
    {
        $exam = Exam::where('id', $examId)->firstOrFail();

        return Inertia::render('ExamPage/ExamPage', [
            'exam' => $exam,
        ]);
    }

    // this is used to show the page for creating a new exam
    public function create()
    {
        return Inertia::render('ExamPage/ExamPage');
    }

    // this is used to store the exam
    public function store() {}


    //TODO er is een create pagina en een edit pagina de edit pagina is gelijk de view/show pagina en de create en edit pagina gebruiken de zelfde componenten
}
