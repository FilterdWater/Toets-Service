import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { startExam, student, submitExam } from '@/routes';
import type { Exam } from '@/types';

type MakeExamProps = {
    exam: Exam;
};

export default function MakeExam({ exam }: MakeExamProps) {
    const missingQuestions = (usePage().props as any).missingQuestions || [];

    const pages: { sections: Exam['sections'] }[] = [];
    let currentPageSections: Exam['sections'] = [];

    exam?.sections?.forEach((section) => {
        if (
            section?.new_page &&
            currentPageSections &&
            currentPageSections.length > 0
        ) {
            pages.push({ sections: currentPageSections });
            currentPageSections = [];
        }
        currentPageSections?.push(section);
    });

    if (currentPageSections.length > 0) {
        pages.push({ sections: currentPageSections });
    }

    const [page, setPage] = useState<number>(() =>
        exam?.submissions && exam.submissions.length > 0 ? 1 : 0,
    );
    const [answers, setAnswers] = useState<Record<number, any>>(() => {
        const saved = localStorage.getItem(`exam-${exam.id}-answers`);
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem(
            `exam-${exam.id}-answers`,
            JSON.stringify(answers),
        );
    }, [exam.id, answers]);

    const handleNextPage = () => setPage(Math.min(page + 1, pages.length + 1));
    const handlePrevPage = () => setPage(Math.max(page - 1, 0));

    const handleAnswerChange = (
        questionId: number,
        value: number | string,
        multiple = false,
        isText = false,
    ) => {
        setAnswers((prev) => {
            if (isText) {
                return { ...prev, [questionId]: value };
            }

            if (multiple) {
                const prevValues: number[] = prev[questionId] || [];
                const updated = prevValues.includes(value as number)
                    ? prevValues.filter((v) => v !== value)
                    : [...prevValues, value as number];
                return { ...prev, [questionId]: updated };
            }

            return { ...prev, [questionId]: value as number };
        });
    };

    const handleStartExam = () => {
        router.post(startExam.url(exam.id));
    };

    const handleSubmitExam = () => {
        router.post(
            submitExam.url(exam.id),
            { answers },
            {
                onSuccess: () => {
                    localStorage.removeItem(`exam-${exam.id}-answers`);
                },
            },
        );
    };

    return (
        <AppHeaderLayout>
            <Head title={`Examen - ${exam.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {page === 0 && (
                    <>
                        <Button
                            className="self-start"
                            variant="outline"
                            onClick={() => router.visit(student.url())}
                        >
                            <ArrowLeft />
                            Terug naar toetsenlijst
                        </Button>
                        <Label className="text-2xl">{exam.name}</Label>
                        <div
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                                __html: exam.description,
                            }}
                        />
                        <div className="self-end">
                            <Button
                                onClick={() => {
                                    handleNextPage();
                                    handleStartExam();
                                }}
                            >
                                Start toets <ArrowRight />
                            </Button>
                        </div>
                    </>
                )}

                {page > 0 &&
                    pages[page - 1]?.sections?.map((section) => (
                        <div key={section.id} className="mb-16">
                            <Label className="mb-8 text-3xl font-bold">
                                {section.name}
                            </Label>

                            {section?.questions?.map((question) => (
                                <>
                                    <div
                                        key={question.id}
                                        id={`question-${question.id}`}
                                        className="mt-6 mb-2"
                                    >
                                        {question.type === 'single_choice' && (
                                            <>
                                                <Card
                                                    className={`mt-1 p-4 ${
                                                        missingQuestions.includes(
                                                            question.id,
                                                        )
                                                            ? 'border-2 border-red-500'
                                                            : ''
                                                    }`}
                                                >
                                                    <Label className="text-lg">
                                                        {question.title}:{' '}
                                                        {question.text}
                                                    </Label>
                                                    <RadioGroup
                                                        value={
                                                            answers[question.id]
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            handleAnswerChange(
                                                                question.id,
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        {question.answers?.map(
                                                            (ans) => (
                                                                <div
                                                                    key={ans.id}
                                                                    className="flex cursor-pointer items-center gap-2"
                                                                >
                                                                    <RadioGroupItem
                                                                        value={ans.id.toString()}
                                                                        id={ans.id.toString()}
                                                                        className="cursor-pointer"
                                                                    />
                                                                    <Label
                                                                        htmlFor={ans.id.toString()}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        {
                                                                            ans.answer_option
                                                                        }
                                                                    </Label>
                                                                </div>
                                                            ),
                                                        )}
                                                    </RadioGroup>
                                                </Card>
                                            </>
                                        )}

                                        {question.type ===
                                            'multiple_choice' && (
                                            <Card
                                                className={`mt-1 p-4 ${
                                                    missingQuestions.includes(
                                                        question.id,
                                                    )
                                                        ? 'border-2 border-red-500'
                                                        : ''
                                                }`}
                                            >
                                                <Label>
                                                    {question.title}:{' '}
                                                    {question.text}
                                                </Label>
                                                {question?.answers?.map(
                                                    (ans) => (
                                                        <div
                                                            key={ans.id}
                                                            className="mt-1 flex items-center gap-2"
                                                        >
                                                            <Label className="flex cursor-pointer items-center gap-2">
                                                                <Checkbox
                                                                    value={
                                                                        ans.id
                                                                    }
                                                                    checked={
                                                                        answers[
                                                                            question
                                                                                .id
                                                                        ]?.includes(
                                                                            ans.id,
                                                                        ) ||
                                                                        false
                                                                    }
                                                                    onCheckedChange={() => {
                                                                        handleAnswerChange(
                                                                            question.id,
                                                                            ans.id,
                                                                            true,
                                                                        );
                                                                    }}
                                                                    id={ans.id.toString()}
                                                                ></Checkbox>
                                                                {
                                                                    ans.answer_option
                                                                }
                                                            </Label>
                                                        </div>
                                                    ),
                                                )}
                                            </Card>
                                        )}

                                        {question.type === 'text' && (
                                            <Card
                                                className={`mt-1 p-4 ${
                                                    missingQuestions.includes(
                                                        question.id,
                                                    )
                                                        ? 'border-2 border-red-500'
                                                        : ''
                                                }`}
                                            >
                                                <Label>
                                                    {question.title}:{' '}
                                                    {question.text}
                                                </Label>
                                                <Textarea
                                                    className="mt-1 max-h-75"
                                                    value={
                                                        answers[question.id] ||
                                                        ''
                                                    }
                                                    placeholder="Vul hier je antwoord in"
                                                    onChange={(e) =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            e.target.value,
                                                            false,
                                                            true,
                                                        )
                                                    }
                                                />
                                            </Card>
                                        )}
                                    </div>
                                    {missingQuestions.includes(question.id) && (
                                        <div className="text-sm text-red-500">
                                            Deze vraag is nog niet beantwoord
                                        </div>
                                    )}
                                </>
                            ))}
                        </div>
                    ))}
                {page > 0 && page <= pages.length + 1 && (
                    <div className="fixed right-0 bottom-0 left-0 border-t bg-accent px-4 py-3">
                        {page > 0 && page <= pages.length && (
                            <div className="mx-auto flex max-w-7xl items-center justify-between">
                                <div>{exam.name}</div>
                                <div>
                                    {page !== 1 && (
                                        <Button
                                            className="mr-3"
                                            onClick={handlePrevPage}
                                        >
                                            Vorige <ArrowLeft />
                                        </Button>
                                    )}
                                    <Button onClick={handleNextPage}>
                                        Volgende <ArrowRight />
                                    </Button>
                                </div>
                            </div>
                        )}
                        {page > 0 && page === pages.length + 1 && (
                            <div className="mx-auto flex max-w-7xl items-center justify-between">
                                <div>{exam.name}</div>
                                <div>
                                    {page > 1 && (
                                        <Button
                                            className="mr-3"
                                            onClick={handlePrevPage}
                                        >
                                            Vorige <ArrowLeft />
                                        </Button>
                                    )}
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={handleSubmitExam}
                                    >
                                        Examen Indienen <Check />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {page === pages.length + 1 && (
                    <div>
                        <Label className="text-2xl">{exam.name}</Label>
                        <div>
                            Je bent aan het einde van de toets aangekomen! Als
                            je klaar bent en alles hebt ingevuld, kun je de
                            toets inleveren.
                        </div>
                    </div>
                )}
            </div>
        </AppHeaderLayout>
    );
}
