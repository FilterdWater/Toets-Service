<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExamResource;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Submission;
use App\Models\UserAnswer;
use App\Services\SubmissionScoreCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(): Response
    {
        $exams = Exam::with('groups')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('teacher/exam/exams', [
            'exams' => $exams,
        ]);
    }

    // the edit function is at the same time also the show method for the admin and teacher
    public function showEdit($examId): Response
    {
        $exam = Exam::where('id', $examId)->firstOrFail();

        return Inertia::render('teacher/exam/exam', [
            'exam' => new ExamResource($exam),
        ]);
    }

    // this is used to show the page for creating a new exam
    public function showCreate(): Response
    {
        return Inertia::render('teacher/exam/exam');
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
        $exam->load([
            'sections.questions.answers',
        ]);

        $submissions = Submission::where('exam_id', $exam->id)
            ->whereNotNull('submitted_at')
            ->with(['user', 'userAnswers'])
            ->latest('submitted_at')
            ->get();

        $results = $submissions->map(function (Submission $submission) use ($exam) {
            $graded = SubmissionScoreCalculator::calculate($submission, $exam);

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
                'total_questions' => $graded['total_questions'],
                'correct_answers' => $graded['correct_answers'],
                'score' => $graded['score'],
                'submitted_at' => $submission->submitted_at,
                'duration_in_seconds' => $durationInSeconds,
                'outdated' => $submission->outdated,
            ];
        });

        $currentResults = $results->where('outdated', false);
        $totalSubmissions = $currentResults->count();
        $averageScore = $totalSubmissions > 0
            ? round($currentResults->avg('score'), 1)
            : 0;
        $passedCount = $currentResults->where('score', '>=', 5.5)->count();

        return Inertia::render('teacher/exam/exam-result', [
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

    public function showSubmissionDetail(Exam $exam, Submission $submission): Response
    {
        abort_unless($submission->exam_id === $exam->id, 404);

        if ($submission->submitted_at === null) {
            abort(404);
        }

        $exam->load([
            'sections' => fn ($q) => $q->orderBy('sequence_nr'),
            'sections.questions' => fn ($q) => $q->orderBy('sequence_nr'),
            'sections.questions.answers',
        ]);

        $submission->load('user');

        $userAnswersByQuestion = $submission->userAnswers()
            ->get()
            ->groupBy('question_id');

        $questionsPayload = [];
        foreach ($exam->sections as $section) {
            foreach ($section->questions as $question) {
                $rows = $userAnswersByQuestion->get($question->id, collect());
                $questionsPayload[] = $this->formatQuestionReview($section->name, $question, $rows);
            }
        }

        $durationInSeconds = null;
        if ($submission->started_at && $submission->submitted_at) {
            $durationInSeconds = $submission->started_at->diffInSeconds($submission->submitted_at);
        }

        return Inertia::render('teacher/exam/exam-submission-detail', [
            'exam' => [
                'id' => $exam->id,
                'name' => $exam->name,
                'description' => $exam->description,
            ],
            'submission' => [
                'id' => $submission->id,
                'submitted_at' => $submission->submitted_at,
                'duration_in_seconds' => $durationInSeconds,
                'outdated' => $submission->outdated,
                'user' => [
                    'id' => $submission->user->id,
                    'name' => $submission->user->name,
                    'email' => $submission->user->email,
                ],
            ],
            'questions' => $questionsPayload,
        ]);
    }

    /**
     * @param  Collection<int, UserAnswer>  $rows
     * @return array<string, mixed>
     */
    private function formatQuestionReview(string $sectionName, Question $question, $rows): array
    {
        $selectedIds = SubmissionScoreCalculator::selectedAnswerIdsFromUserAnswerRows($rows);

        $isCorrect = null;
        if ($question->type === 'text') {
            $isCorrect = null;
        } else {
            $isCorrect = SubmissionScoreCalculator::isQuestionAnswerCorrect($question, $rows);
        }

        return [
            'id' => $question->id,
            'section_name' => $sectionName,
            'title' => $question->title,
            'text' => $question->text,
            'type' => $question->type,
            'is_correct' => $isCorrect,
            'options' => $question->answers->map(fn ($a) => [
                'id' => $a->id,
                'answer_option' => $a->answer_option,
                'is_correct' => (bool) $a->is_correct,
            ])->values()->all(),
            'student_selected_ids' => $question->type === 'text' ? [] : $selectedIds,
            'student_text' => $question->type === 'text' ? ($rows->first()?->text_answer) : null,
        ];
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $exam->delete();

        return redirect('/docent/toetsen')->with('success', 'toets succesvol verwijderd');
    }

    /**
     * Marks the submission as outdated so the student may start a new attempt. Irreversible.
     * Only allowed for insufficient (onvoldoende) scores.
     */
    public function allowSubmissionRetake(Exam $exam, Submission $submission): RedirectResponse
    {
        abort_unless($submission->exam_id === $exam->id, 404);

        if ($submission->submitted_at === null) {
            abort(422);
        }

        if ($submission->outdated) {
            abort(422);
        }

        $submission->load('userAnswers');
        $graded = SubmissionScoreCalculator::calculate($submission, $exam);
        $score = $graded['score'];

        if ($score >= 5.5) {
            abort(422);
        }

        $submission->update(['outdated' => true]);

        return back();
    }
}
