<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExamResource;
use App\Models\Exam;
use App\Models\Submission;
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

        return Inertia::render('exam/exams', [
            'exams' => $exams,
        ]);
    }

    // the edit function is at the same time also the show method for the admin and teacher
    public function showEdit(Request $request, $examId): Response
    {
        $exam = Exam::where('id', $examId)->firstOrFail();

        return Inertia::render('exam/exam', [
            'exam' => new ExamResource($exam),
        ]);
    }

    // this is used to show the page for creating a new exam
    public function showCreate(): Response
    {
        return Inertia::render('exam/exam');
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

        return redirect('/docent/toetsen')->with('success', 'Toets succesvol opgeslagen');
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

        return back()->with('success', 'Exam succesvol gewijzigd.');
    }

    public function showResults(Exam $exam): Response
    {
        $exam->load('sections');

        $submissions = Submission::where('exam_id', $exam->id)
            ->whereNotNull('submitted_at')
            ->where('outdated', false)
            ->with(['user', 'userAnswers.selectedAnswer'])
            ->latest('submitted_at')
            ->get();

        $results = $submissions->map(function (Submission $submission) {
            $totalQuestions = $submission->userAnswers->count();
            $correctAnswers = $submission->userAnswers
                ->filter(fn ($ua) => $ua->selectedAnswer?->is_correct)
                ->count();

            $durationInSeconds = null;
            if ($submission->started_at && $submission->submitted_at) {
                $durationInSeconds = $submission->started_at->diffInSeconds($submission->submitted_at);
            }

            return [
                'id' => $submission->id,
                'user' => [
                    'id' => $submission->user->id,
                    'name' => $submission->user->name,
                    'email' => $submission->user->email,
                ],
                'total_questions' => $totalQuestions,
                'correct_answers' => $correctAnswers,
                'score' => $totalQuestions > 0
                    ? round(($correctAnswers / $totalQuestions) * 10, 1)
                    : 0,
                'submitted_at' => $submission->submitted_at,
                'duration_in_seconds' => $durationInSeconds,
            ];
        });

        $totalSubmissions = $results->count();
        $averageScore = $totalSubmissions > 0
            ? round($results->avg('score'), 1)
            : 0;
        $passedCount = $results->where('score', '>=', 5.5)->count();

        return Inertia::render('exam-result/exam-result', [
            'exam' => new ExamResource($exam),
            'results' => $results->values(),
            'summary' => [
                'total_submissions' => $totalSubmissions,
                'average_score' => $averageScore,
                'passed_count' => $passedCount,
                'failed_count' => $totalSubmissions - $passedCount,
            ],
        ]);
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $exam->delete();

        return redirect('/docent/toetsen')->with('success', 'toets succesvol verwijderd');
    }
}
