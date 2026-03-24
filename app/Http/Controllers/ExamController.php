<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExamResource;
use App\Models\Exam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    // the edit function is at the same time also the show method for the admin and teacher
    public function edit(Request $request, $examId): Response
    {
        $exam = Exam::where('id', $examId)->firstOrFail();

        return Inertia::render('ExamPage/ExamPage', [
//            'exam' => array_merge($exam->toArray(), [
//                'created_at' => $exam->created_at?->format('d-m-Y H:i'),
//                'updated_at' => $exam->updated_at?->format('d-m-Y H:i'),
//                'active_from' => $exam->active_from?->format('Y-m-d'),
//                'active_until' => $exam->active_until?->format('Y-m-d'),
//            ]),
            'exam' => new ExamResource($exam),
        ]);
    }

    // this is used to show the page for creating a new exam
    public function create(): Response
    {
        return Inertia::render('ExamPage/ExamPage');
    }

    // this is used to store the exam in the database
    public function store() {}

    public function update(Request $request, Exam $exam): RedirectResponse
    {
        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:4'],
            'description' => ['nullable', 'string', 'max:255'], // TODO should be longer
            'active_from' => ['nullable', 'date'],
            'active_until' => ['nullable', 'date', 'after_or_equal:active_from'],
            'globally_available' => ['required', 'boolean'],
            'max_mistakes' => ['nullable', 'integer', 'min:0'],
        ]);

        $exam->update($validatedData);

        return back()->with('success', 'Exam updated successfully.');
    }
}
