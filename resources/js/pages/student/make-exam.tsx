import { Head, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { makeExam, startExam, student, submitExam } from '@/routes';
import type { BreadcrumbItem, Exam } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardTitle } from '@/components/ui/card';

type MakeExamProps = {
    exam: Exam;
};

export default function MakeExam({ exam }: MakeExamProps) {
    console.log(exam);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Student',
            href: student.url(),
        },
        {
            title: exam.name,
            href: makeExam.url({ id: exam.id }),
        },
    ];

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

    const [page, setPage] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<number, any>>(() => {
        const saved = localStorage.getItem(`exam-${exam.id}-answers`);
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem(
            `exam-${exam.id}-answers`,
            JSON.stringify(answers),
        );
    }, [answers]);

    useEffect(() => {
        if (exam && exam.submissions!.length > 0) {
            setPage(1);
        }
    }, [exam?.submissions]);

    const handleNextPage = () => setPage(Math.min(page + 1, pages.length));
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
        <AppHeaderLayout breadcrumbs={page === 0 ? breadcrumbs : undefined}>
            <Head title={`Examen - ${exam.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {page === 0 && (
                    <>
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
                {page > 0 && page < pages.length && (
                    <div
                        className={`flex w-full ${page !== 1 ? 'justify-between' : 'justify-end'}`}
                    >
                        {page !== 1 && (
                            <Button onClick={handlePrevPage}>
                                Vorige <ArrowLeft />
                            </Button>
                        )}
                        <Button onClick={handleNextPage}>
                            Volgende <ArrowRight />
                        </Button>
                    </div>
                )}
                {page > 0 && page === pages.length && (
                    <div className="flex justify-between">
                        {page > 1 &&
                        <Button onClick={handlePrevPage}>
                            Vorige <ArrowLeft />
                        </Button>
                        }
                        <Button
                            className="bg-green-600"
                            onClick={handleSubmitExam}
                        >
                            Inleveren
                        </Button>
                    </div>
                )}

                {page > 0 &&
                    pages[page - 1].sections?.map((section) => (
                        <div key={section.id} className="mb-8">
                            <Label className="mb-4 text-xl">
                                {section.name}
                            </Label>

                            {section?.questions?.map((question) => (
                                <div key={question.id} className="mb-6">
                                    <Label>
                                        {question.title}: {question.text}
                                    </Label>

                                    {question.type === 'single_choice' &&
                                            <div
                                                className="mt-1 flex items-center gap-2"
                                            >
                                                <RadioGroup
                                                    value={answers[question.id]}
                                                    onValueChange={(value) =>
                                                        handleAnswerChange(question.id, value)
                                                    }
                                                >
                                                    {question.answers?.map((ans) => (
                                                        <div key={ans.id} className="flex items-center gap-2">
                                                            <RadioGroupItem value={(ans.id).toString()} id={(ans.id).toString()} />
                                                            <Label htmlFor={(ans.id).toString()}>{ans.answer_option}</Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                        }

                                    {question.type === 'multiple_choice' &&
                                        question?.answers?.map((ans) => (
                                            <div
                                                key={ans.id}
                                                className="mt-1 flex items-center gap-2"
                                            >
                                                <Label className="flex items-center gap-2 cursor-pointer">
                                                    <Checkbox 
                                                            value={ans.id}
                                                            checked={
                                                                answers[question.id]?.includes(ans.id) || false
                                                            }
                                                            onCheckedChange={() => {
                                                                handleAnswerChange(question.id, ans.id, true);
                                                            }}
                                                            id={(ans.id).toString()}
                                                    >
                                                    </Checkbox>
                                                    {ans.answer_option}
                                                </Label>
                                            </div>
                                        ))}

                                    {question.type === 'text' && (
                                        <Textarea
                                            className='mt-1'
                                            value={answers[question.id] || ''}
                                            onChange={(e) =>
                                                handleAnswerChange(
                                                    question.id,
                                                    e.target.value,
                                                    false,
                                                    true,
                                                )
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                {page > 0 && page < pages.length && (
                    <div
                        className={`flex w-full ${page !== 1 ? 'justify-between' : 'justify-end'}`}
                    >
                        {page !== 1 && (
                            <Button onClick={handlePrevPage}>
                                Vorige <ArrowLeft />
                            </Button>
                        )}
                        <Button onClick={handleNextPage}>
                            Volgende <ArrowRight />
                        </Button>
                    </div>
                )}
                {page > 0 && page === pages.length && (
                    <div className="flex justify-between">
                        {page > 1 &&
                        <Button onClick={handlePrevPage}>
                            Vorige <ArrowLeft />
                        </Button>
                        }
                        <Button
                            className="bg-green-600"
                            onClick={handleSubmitExam}
                        >
                            Inleveren
                        </Button>
                    </div>
                )}
            </div>
        </AppHeaderLayout>
    );
}
