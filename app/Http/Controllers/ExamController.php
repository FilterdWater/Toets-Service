<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $exam = Exam::with('sections.questions.answers')->where('id', $examId)->firstOrFail();

        return Inertia::render('exam/exam', [
            'exam' => array_merge(
                $exam->toArray(),
                [
                    'created_at' => $exam->created_at?->format('d-m-Y H:i'),
                    'updated_at' => $exam->updated_at?->format('d-m-Y H:i'),
                ]
            ),
        ]);
    }

    // this is used to show the page for creating a new exam
    public function showCreate(): Response
    {
        return Inertia::render('exam/exam');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:4'],
            'description' => ['nullable', 'string'],
            'active_from' => ['nullable', 'date'],
            'active_until' => ['nullable', 'date', 'after_or_equal:active_from'],
            'globally_available' => ['required', 'boolean'],
            'max_mistakes' => ['nullable', 'integer', 'min:0'],
            'sections' => ['array'],
            'sections.*.name' => ['required', 'string'],
            'sections.*.sequence_nr' => ['required', 'integer', 'distinct'],
            'sections.*.new_page' => ['required', 'boolean'],
            'sections.*.questions' => [
                'array',
                function (string $attribute, $value, Closure $fail) {
                    $dupes = collect($value)
                        ->pluck('sequence_nr')
                        ->filter(fn ($v) => $v !== null)
                        ->duplicates();
                    if ($dupes->isNotEmpty()) {
                        $fail('De vragen in elke sectie moeten unieke volgnummers hebben. Duplicaten: '.$dupes->implode(', '));
                    }
                },
            ],
            'sections.*.questions.*' => [
                function (string $attribute, $value, Closure $fail) {
                    $type = $value['type'] ?? '';
                    $answers = $value['answers'] ?? [];
                    $title = $value['title'] ?? 'ongeldige titel';
                    if (in_array($type, ['single_choice', 'multiple_choice'])) {
                        $hasCorrectAnswer = collect($answers)->contains('is_correct', true);
                        if (! $hasCorrectAnswer) {
                            $fail('De vraag "'.$title.'" moet ten minste één correct antwoord hebben.');
                        }
                        if (count($answers) < 2) {
                            $fail('De vraag "'.$title.'" moet ten minste twee antwoordmogelijkheden hebben.');
                        }
                    }
                },
            ],
            'sections.*.questions.*.title' => ['required', 'string'],
            'sections.*.questions.*.text' => ['string', 'nullable'],
            'sections.*.questions.*.type' => ['required', 'string', 'in:single_choice,multiple_choice,text'],
            'sections.*.questions.*.sequence_nr' => ['required', 'integer'],
            'sections.*.questions.*.answers' => ['array'],
            'sections.*.questions.*.answers.*.answer_option' => ['required', 'string'],
            'sections.*.questions.*.answers.*.is_correct' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated) {
            $exam = Exam::create([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'active_from' => $validated['active_from'],
                'active_until' => $validated['active_until'],
                'globally_available' => $validated['globally_available'],
                'max_mistakes' => $validated['max_mistakes'],
            ]);

            foreach ($validated['sections'] ?? [] as $sectionData) {
                $section = $exam->sections()->create([
                    'name' => $sectionData['name'],
                    'sequence_nr' => $sectionData['sequence_nr'],
                    'new_page' => $sectionData['new_page'],
                ]);

                foreach ($sectionData['questions'] ?? [] as $questionData) {
                    $question = $section->questions()->create([
                        'title' => $questionData['title'],
                        'text' => $questionData['text'],
                        'type' => $questionData['type'],
                        'sequence_nr' => $questionData['sequence_nr'],
                    ]);

                    foreach ($questionData['answers'] ?? [] as $answerData) {
                        $question->answers()->create([
                            'answer_option' => $answerData['answer_option'],
                            'is_correct' => $answerData['is_correct'],
                        ]);
                    }
                }
            }
        });

        return redirect('/docent/toetsen')
            ->with('success', 'Toets succesvol aangemaakt');
    }

    public function update(Request $request, Exam $exam): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:4'],
            'description' => ['nullable', 'string'],
            'active_from' => ['nullable', 'date'],
            'active_until' => ['nullable', 'date', 'after_or_equal:active_from'],
            'globally_available' => ['required', 'boolean'],
            'max_mistakes' => ['nullable', 'integer', 'min:0'],
            'sections' => ['array'],
            'sections.*.id' => ['nullable', 'integer'],
            'sections.*.name' => ['required', 'string'],
            'sections.*.sequence_nr' => ['required', 'integer', 'distinct'],
            'sections.*.new_page' => ['required', 'boolean'],
            'sections.*.questions' => [
                'array',
                function (string $attribute, $value, Closure $fail) {
                    $dupes = collect($value)
                        ->pluck('sequence_nr')
                        ->filter(fn ($v) => $v !== null)
                        ->duplicates();
                    if ($dupes->isNotEmpty()) {
                        $fail('De vragen in elke sectie moeten unieke volgnummers hebben. Duplicaten: '.$dupes->implode(', '));
                    }
                },
            ],
            'sections.*.questions.*' => [
                function (string $attribute, $value, Closure $fail) {
                    $type = $value['type'] ?? '';
                    $answers = $value['answers'] ?? [];
                    $title = $value['title'] ?? 'ongeldige titel';

                    if (in_array($type, ['single_choice', 'multiple_choice'])) {
                        $hasCorrectAnswer = collect($answers)->contains('is_correct', true);

                        if (! $hasCorrectAnswer) {
                            $fail('De vraag "'.$title.'" moet ten minste één correct antwoord hebben.');
                        }

                        if (count($answers) < 2) {
                            $fail('De vraag "'.$title.'" moet ten minste twee antwoordmogelijkheden hebben.');
                        }
                    }
                },
            ],
            'sections.*.questions.*.id' => ['nullable', 'integer'],
            'sections.*.questions.*.title' => ['required', 'string'],
            'sections.*.questions.*.text' => ['string', 'nullable'],
            'sections.*.questions.*.type' => ['required', 'string', 'in:single_choice,multiple_choice,text'],
            'sections.*.questions.*.sequence_nr' => ['required', 'integer'],
            'sections.*.questions.*.answers' => ['array'],
            'sections.*.questions.*.answers.*.id' => ['nullable', 'integer'],
            'sections.*.questions.*.answers.*.answer_option' => ['required', 'string'],
            'sections.*.questions.*.answers.*.is_correct' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated, $exam) {
            $exam->update($validated);

            // this here deletes all sections that are not present in the data sent from the frontend
            $sectionIds = collect($validated['sections'])->pluck('id')->filter()->toArray();
            $exam->sections()->whereNotIn('id', $sectionIds)->delete();

            foreach ($validated['sections'] as $sectionData) {
                $section = $exam->sections()->updateOrCreate(
                    ['id' => $sectionData['id'] ?? null],
                    [
                        'name' => $sectionData['name'],
                        'sequence_nr' => $sectionData['sequence_nr'],
                        'new_page' => $sectionData['new_page'],
                    ]
                );

                // this here deletes all questions that are not present in the data sent from the frontend
                $questionIds = collect($sectionData['questions'] ?? [])->pluck('id')->filter()->toArray();
                $section->questions()->whereNotIn('id', $questionIds)->delete();

                foreach ($sectionData['questions'] ?? [] as $questionData) {
                    $question = $section->questions()->updateOrCreate(
                        ['id' => $questionData['id'] ?? null],
                        [
                            'title' => $questionData['title'],
                            'text' => $questionData['text'],
                            'type' => $questionData['type'],
                            'sequence_nr' => $questionData['sequence_nr'],
                        ]
                    );

                    // this here deletes all answers that are not present in the data sent from the frontend
                    $answerIds = collect($questionData['answers'] ?? [])->pluck('id')->filter()->toArray();
                    $question->answers()->whereNotIn('id', $answerIds)->delete();

                    foreach ($questionData['answers'] ?? [] as $answerData) {
                        $question->answers()->updateOrCreate(
                            ['id' => $answerData['id'] ?? null],
                            [
                                'answer_option' => $answerData['answer_option'],
                                'is_correct' => $answerData['is_correct'],
                            ]
                        );
                    }
                }
            }
        });

        return back()->with('success', 'Toets succesvol gewijzigd.');
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $exam->delete();

        return redirect('/docent/toetsen')->with('success', 'Toets succesvol verwijderd');
    }
}
