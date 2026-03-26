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
    public function index(): Response
    {
        $exams = Exam::with('groups')
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return Inertia::render('exams-page', [
            'exams' => $exams,
        ]);
    }

    // the edit function is at the same time also the show method for the admin and teacher
    public function edit(Request $request, $examId): Response
    {
        $exam = Exam::where('id', $examId)->firstOrFail();

        return Inertia::render('exam-page/exam-page', [
            'exam' => new ExamResource($exam),
        ]);
    }

    // this is used to show the page for creating a new exam
    public function create(): Response
    {
        return Inertia::render('exam-page/exam-page');
    }

    // this is used to store the exam in the database
    public function store(Request $request): RedirectResponse
    {
        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:4'],
            'description' => ['nullable', 'string', 'max:255'], // TODO should be longer
            'active_from' => ['nullable', 'date'],
            'active_until' => ['nullable', 'date', 'after_or_equal:active_from'],
            'globally_available' => ['required', 'boolean'],
            'max_mistakes' => ['nullable', 'integer', 'min:0'],
        ]);

        Exam::create($validatedData);

        return redirect('/docent/toetsen')->with('success', 'toets succesvol opgeslagen');
    }

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

    public function destroy(Exam $exam): RedirectResponse
    {
        $exam->delete();

        return redirect('/docent/toetsen')->with('success', 'toets succesvol verwijderd');
    }
}
