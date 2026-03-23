<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserAnswerSeeder extends Seeder
{
    public function run(): void
    {
        $submissions = DB::table('submission')->whereNotNull('submitted_at')->get();

        foreach ($submissions as $submission) {
            $exam = DB::table('exams')->where('id', $submission->exam_id)->first();
            $sections = DB::table('sections')->where('exam_id', $exam->id)->pluck('id');
            $questions = DB::table('questions')->whereIn('section_id', $sections)->get();

            foreach ($questions as $question) {
                if ($question->type === 'text') {
                    $textAnswers = [
                        'Fotosynthese is het proces waarbij planten zonlicht omzetten in energie.',
                        'Celdeling is het proces waarbij een cel zich splitst in twee identieke cellen.',
                        'Een atoom is een enkel deeltje, een molecuul is een combinatie van atomen.',
                        'De lucht lijkt blauw door Rayleigh-verstrooiing van zonlicht.',
                    ];

                    DB::table('user_answers')->insert([
                        'submission_id' => $submission->id,
                        'question_id' => $question->id,
                        'selected_answer' => null,
                        'text_answer' => collect($textAnswers)->random(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    $answers = DB::table('answers')->where('question_id', $question->id)->get();

                    if ($question->type === 'single_choice') {
                        $selectedAnswer = $answers->random();
                        DB::table('user_answers')->insert([
                            'submission_id' => $submission->id,
                            'question_id' => $question->id,
                            'selected_answer' => $selectedAnswer->id,
                            'text_answer' => null,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    } else {
                        $correctAnswers = $answers->where('is_correct', true);
                        $wrongAnswers = $answers->where('is_correct', false);

                        if ($correctAnswers->isNotEmpty() && rand(0, 1)) {
                            $selectedAnswer = $correctAnswers->random();
                        } else {
                            $selectedAnswer = $wrongAnswers->random();
                        }

                        DB::table('user_answers')->insert([
                            'submission_id' => $submission->id,
                            'question_id' => $question->id,
                            'selected_answer' => $selectedAnswer->id,
                            'text_answer' => null,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }
    }
}
