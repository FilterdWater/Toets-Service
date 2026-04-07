<?php

use App\Enums\Role;
use App\Models\Answer;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Section;
use App\Models\User;

test('store uses per-question scoring for multiple choice answers', function (): void {
    $student = User::factory()->create([
        'role' => Role::Student,
    ]);

    $exam = Exam::factory()->active()->create();
    $exam->users()->attach($student->id);

    $section = Section::factory()->create(['exam_id' => $exam->id]);

    $multipleChoiceQuestion = Question::factory()->multipleChoice()->create([
        'section_id' => $section->id,
        'sequence_nr' => 1,
    ]);
    $multipleCorrectA = Answer::factory()->correct()->create([
        'question_id' => $multipleChoiceQuestion->id,
    ]);
    $multipleCorrectB = Answer::factory()->correct()->create([
        'question_id' => $multipleChoiceQuestion->id,
    ]);
    Answer::factory()->incorrect()->create([
        'question_id' => $multipleChoiceQuestion->id,
    ]);

    $singleChoiceQuestion = Question::factory()->singleChoice()->create([
        'section_id' => $section->id,
        'sequence_nr' => 2,
    ]);
    $singleCorrect = Answer::factory()->correct()->create([
        'question_id' => $singleChoiceQuestion->id,
    ]);
    Answer::factory()->incorrect()->create([
        'question_id' => $singleChoiceQuestion->id,
    ]);

    $this->actingAs($student);

    $response = $this->post(route('submitExam', $exam->id), [
        'answers' => [
            // Use string IDs as sent by the form payload.
            $multipleChoiceQuestion->id => [
                (string) $multipleCorrectA->id,
                (string) $multipleCorrectB->id,
            ],
            $singleChoiceQuestion->id => (string) $singleCorrect->id,
        ],
    ]);

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('student/exam-result')
        ->where('result.total_questions', 2)
        ->where('result.correct_answers', 2)
    );
});

test('store marks multiple choice as incorrect when selection is incomplete', function (): void {
    $student = User::factory()->create([
        'role' => Role::Student,
    ]);

    $exam = Exam::factory()->active()->create();
    $exam->users()->attach($student->id);

    $section = Section::factory()->create(['exam_id' => $exam->id]);

    $multipleChoiceQuestion = Question::factory()->multipleChoice()->create([
        'section_id' => $section->id,
        'sequence_nr' => 1,
    ]);
    $multipleCorrectA = Answer::factory()->correct()->create([
        'question_id' => $multipleChoiceQuestion->id,
    ]);
    Answer::factory()->correct()->create([
        'question_id' => $multipleChoiceQuestion->id,
    ]);
    Answer::factory()->incorrect()->create([
        'question_id' => $multipleChoiceQuestion->id,
    ]);

    $this->actingAs($student);

    $response = $this->post(route('submitExam', $exam->id), [
        'answers' => [
            $multipleChoiceQuestion->id => [
                (string) $multipleCorrectA->id,
            ],
        ],
    ]);

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('student/exam-result')
        ->where('result.total_questions', 1)
        ->where('result.correct_answers', 0)
    );
});
