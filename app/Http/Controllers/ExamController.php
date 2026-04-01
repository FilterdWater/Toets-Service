<?php

namespace App\Http\Controllers;

use App\Models\Exam;
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
        $exam = Exam::with('sections.questions')->where('id', $examId)->firstOrFail();

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
            'sections.*.questions' => ['array'],
            'sections.*.questions.*.id' => ['nullable', 'integer'],
            'sections.*.questions.*.title' => ['required', 'string'],
            'sections.*.questions.*.text' => ['nullable', 'string'],
            'sections.*.questions.*.type' => ['required', 'string'],
            'sections.*.questions.*.sequence_nr' => ['required', 'integer', 'distinct'],
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
                    $section->questions()->updateOrCreate(
                        ['id' => $questionData['id'] ?? null],
                        [
                            'title' => $questionData['title'],
                            'text' => $questionData['text'],
                            'type' => $questionData['type'],
                            'sequence_nr' => $questionData['sequence_nr'],
                        ]
                    );
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
