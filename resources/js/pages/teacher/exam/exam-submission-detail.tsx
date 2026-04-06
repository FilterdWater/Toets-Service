import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn, dateToReadableString, formatDuration } from '@/lib/utils';
import { examResults, examSubmissionDetail, exams } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type QuestionReview = {
    id: number;
    section_name: string;
    title: string;
    text: string;
    type: string;
    is_correct: boolean | null;
    options: {
        id: number;
        answer_option: string;
        is_correct: boolean;
    }[];
    student_selected_ids: number[];
    student_text: string | null;
};

type ExamSubmissionDetailProps = {
    exam: {
        id: number;
        name: string;
        description: string | null;
    };
    submission: {
        id: number;
        submitted_at: string | null;
        duration_in_seconds: number | null;
        outdated: boolean;
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    questions: QuestionReview[];
};

export default function ExamSubmissionDetail({
    exam,
    submission,
    questions,
}: ExamSubmissionDetailProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Toetsen', href: exams() },
        {
            title: exam.name,
            href: examResults.url({ exam: exam.id }),
        },
        {
            title: submission.user.name,
            href: examSubmissionDetail.url({
                exam: exam.id,
                submission: submission.id,
            }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`Inzending — ${submission.user.name} — ${exam.name}`}
            />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">{exam.name}</h1>
                    <p className="mt-1 text-muted-foreground">
                        {submission.user.name} ({submission.user.email})
                    </p>
                    {exam.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            {exam.description}
                        </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                            Ingeleverd:{' '}
                            {dateToReadableString(submission.submitted_at)}
                        </span>
                        <span>
                            Tijdsduur:{' '}
                            {formatDuration(submission.duration_in_seconds)}
                        </span>
                        {submission.outdated && (
                            <Badge variant="secondary">Herkansen</Badge>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {questions.map((q, index) => (
                        <Card key={q.id}>
                            <CardHeader className="pb-2">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">
                                            {q.section_name} · Vraag {index + 1}
                                        </p>
                                        <CardTitle className="text-base">
                                            {q.title}
                                        </CardTitle>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {q.text}
                                        </p>
                                    </div>
                                    {q.type !== 'text' &&
                                        q.is_correct !== null && (
                                            <Badge
                                                variant={
                                                    q.is_correct
                                                        ? 'student'
                                                        : 'destructive'
                                                }
                                            >
                                                {q.is_correct ? 'Goed' : 'Fout'}
                                            </Badge>
                                        )}
                                    {q.type === 'text' && (
                                        <Badge variant="secondary">
                                            Open antwoord
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {q.type === 'text' ? (
                                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                                            Antwoord van student
                                        </p>
                                        <p className="whitespace-pre-wrap">
                                            {q.student_text?.trim() ||
                                                '— geen tekst —'}
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {q.options.map((opt) => {
                                            const chosen =
                                                q.student_selected_ids.includes(
                                                    opt.id,
                                                );
                                            return (
                                                <li
                                                    key={opt.id}
                                                    className={cn(
                                                        'flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm',
                                                        opt.is_correct &&
                                                            'border-green-600/50 bg-green-500/10',
                                                        chosen &&
                                                            !opt.is_correct &&
                                                            'border-red-600/50 bg-red-500/10',
                                                        !chosen &&
                                                            !opt.is_correct &&
                                                            'border-border/80 bg-transparent',
                                                    )}
                                                >
                                                    <span className="min-w-0 flex-1">
                                                        {opt.answer_option}
                                                    </span>
                                                    <span className="flex shrink-0 gap-1">
                                                        {opt.is_correct && (
                                                            <Badge variant="student">
                                                                Juiste optie
                                                            </Badge>
                                                        )}
                                                        {chosen && (
                                                            <Badge
                                                                variant={
                                                                    opt.is_correct
                                                                        ? 'secondary'
                                                                        : 'destructive'
                                                                }
                                                            >
                                                                Gekozen
                                                            </Badge>
                                                        )}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
