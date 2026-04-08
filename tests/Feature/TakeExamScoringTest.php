<?php

use App\Enums\Role;
use App\Models\Answer;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Section;
use App\Models\Submission;
use App\Models\User;
use App\Models\UserAnswer;

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

test('store can repeat only incorrectly answered questions', function (): void {
    $student = User::factory()->create([
        'role' => Role::Student,
    ]);

    $exam = Exam::factory()->active()->create();
    $exam->users()->attach($student->id);
    $section = Section::factory()->create(['exam_id' => $exam->id]);

    $questionOne = Question::factory()->singleChoice()->create([
        'section_id' => $section->id,
        'sequence_nr' => 1,
    ]);
    $questionOneCorrect = Answer::factory()->correct()->create([
        'question_id' => $questionOne->id,
    ]);
    $questionOneWrong = Answer::factory()->incorrect()->create([
        'question_id' => $questionOne->id,
    ]);

    $questionTwo = Question::factory()->singleChoice()->create([
        'section_id' => $section->id,
        'sequence_nr' => 2,
    ]);
    $questionTwoCorrect = Answer::factory()->correct()->create([
        'question_id' => $questionTwo->id,
    ]);
    Answer::factory()->incorrect()->create([
        'question_id' => $questionTwo->id,
    ]);

    $previousSubmission = Submission::factory()->create([
        'user_id' => $student->id,
        'exam_id' => $exam->id,
        'started_at' => now()->subMinutes(5),
        'submitted_at' => now()->subMinutes(4),
        'outdated' => true,
        'retake_mode' => 'incorrect_only',
    ]);

    UserAnswer::factory()->create([
        'submission_id' => $previousSubmission->id,
        'question_id' => $questionOne->id,
        'selected_answer' => $questionOneWrong->id,
    ]);
    UserAnswer::factory()->create([
        'submission_id' => $previousSubmission->id,
        'question_id' => $questionTwo->id,
        'selected_answer' => $questionTwoCorrect->id,
    ]);

    $this->actingAs($student);

    $response = $this->post(route('submitExam', $exam->id), [
        'answers' => [
            $questionOne->id => (string) $questionOneCorrect->id,
        ],
    ]);

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('student/exam-result')
        ->where('result.total_questions', 2)
        ->where('result.correct_answers', 2)
        ->where('result.incorrect_questions', 0)
    );
});
