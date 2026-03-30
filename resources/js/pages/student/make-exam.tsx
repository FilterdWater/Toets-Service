import { Head } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { makeExam, student } from '@/routes';
import type { BreadcrumbItem, Exam } from '@/types';

type MakeExamProps = {
    exam: Exam;
};

export default function MakeExam({ exam }: MakeExamProps) {
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

    const handleNextPage = () => setPage(Math.min(page + 1, pages.length));
    const handlePrevPage = () => setPage(Math.max(page - 1, 0));

    const handleAnswerChange = (
        questionId: number,
        value: any,
        multiple = false,
    ) => {
        setAnswers((prev) => {
            if (multiple) {
                const prevValues: string[] = prev[questionId] || [];
                const updated = prevValues.includes(value)
                    ? prevValues.filter((v) => v !== value)
                    : [...prevValues, value];
                return { ...prev, [questionId]: updated };
            }
            return { ...prev, [questionId]: value };
        });
    };

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>
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
                            <Button onClick={handleNextPage}>
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
                        <Button onClick={handlePrevPage}>
                            Vorige <ArrowLeft />
                        </Button>
                        <Button className="bg-green-600">Inleveren</Button>
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
                                        question?.answers?.map((ans) => (
                                            <div
                                                key={ans.id}
                                                className="mt-1 flex items-center gap-2"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`q-${question.id}`}
                                                    value={ans.answer_option}
                                                    checked={
                                                        answers[question.id] ===
                                                        ans.answer_option
                                                    }
                                                    onChange={() =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            ans.answer_option,
                                                        )
                                                    }
                                                />
                                                <span>{ans.answer_option}</span>
                                            </div>
                                        ))}

                                    {question.type === 'multiple_choice' &&
                                        question?.answers?.map((ans) => (
                                            <div
                                                key={ans.id}
                                                className="mt-1 flex items-center gap-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={ans.answer_option}
                                                    checked={
                                                        answers[
                                                            question.id
                                                        ]?.includes(
                                                            ans.answer_option,
                                                        ) || false
                                                    }
                                                    onChange={() =>
                                                        handleAnswerChange(
                                                            question.id,
                                                            ans.answer_option,
                                                            true,
                                                        )
                                                    }
                                                />
                                                <span>{ans.answer_option}</span>
                                            </div>
                                        ))}

                                    {question.type === 'text' && (
                                        <textarea
                                            className="mt-1 w-full rounded border p-2"
                                            value={answers[question.id] || ''}
                                            onChange={(e) =>
                                                handleAnswerChange(
                                                    question.id,
                                                    e.target.value,
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
                        <Button onClick={handlePrevPage}>
                            Vorige <ArrowLeft />
                        </Button>
                        <Button className="bg-green-600">Inleveren</Button>
                    </div>
                )}
            </div>
        </AppHeaderLayout>
    );
}
