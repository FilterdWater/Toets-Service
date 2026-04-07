import { Head, router } from '@inertiajs/react';
import { Pie, PieChart } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dateToReadableString, formatDuration } from '@/lib/utils';
import ResultStatCard from '@/pages/student/components/result-stat-card';
import {
    examResults,
    examSubmissionDetail,
    exams,
    submissionAllowRetake,
} from '@/routes';
import type { BreadcrumbItem, Exam } from '@/types';

type StudentResult = {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    total_questions: number;
    correct_answers: number;
    score: number;
    submitted_at: string | null;
    duration_in_seconds: number | null;
    outdated: boolean;
};

type ExamResultProps = {
    exam: Exam;
    results: StudentResult[];
    summary: {
        total_submissions: number;
        average_score: number;
        passed_count: number;
        failed_count: number;
    };
};

const chartConfig = {
    passed: {
        label: 'Voldoende',
        color: 'var(--color-green-500)',
    },
    failed: {
        label: 'Onvoldoende',
        color: 'var(--color-red-500)',
    },
} satisfies ChartConfig;

export default function ExamResult({
    exam,
    results,
    summary,
}: ExamResultProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Toetsen', href: exams() },
        {
            title: exam.name,
            href: examResults.url({ exam: exam.id }),
        },
    ];

    const passFailData = [
        {
            name: 'passed',
            value: summary.passed_count,
            fill: 'var(--color-green-500)',
        },
        {
            name: 'failed',
            value: summary.failed_count,
            fill: 'var(--color-red-500)',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Resultaten - ${exam.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">{exam.name}</h1>
                    {exam.description && (
                        <p className="mt-2 text-muted-foreground">
                            {exam.description}
                        </p>
                    )}
                    {exam.sections && exam.sections.length > 0 && (
                        <div className="mt-4 rounded-lg border border-border/80 bg-muted/40 p-4">
                            <p className="mb-2 text-sm font-medium text-foreground">
                                Secties
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {exam.sections.map((section) => (
                                    <Badge key={section.id} variant="secondary">
                                        {section.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <ResultStatCard title="Inzendingen">
                        {summary.total_submissions}
                    </ResultStatCard>
                    <ResultStatCard title="Gemiddeld cijfer">
                        {summary.average_score}
                    </ResultStatCard>
                    <ResultStatCard title="Voldoende">
                        {summary.passed_count}
                    </ResultStatCard>
                    <ResultStatCard title="Onvoldoende">
                        {summary.failed_count}
                    </ResultStatCard>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
                    <Card className="min-w-0 xl:col-span-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">
                                Resultaten per student
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {results.length === 0 ? (
                                <p className="text-muted-foreground">
                                    Nog geen inzendingen.
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Score</TableHead>
                                                <TableHead>
                                                    Goed / Totaal
                                                </TableHead>
                                                <TableHead>Tijdsduur</TableHead>
                                                <TableHead>
                                                    Ingeleverd
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-[140px]">
                                                    Herkansen
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.map((r) => (
                                                <TableRow
                                                    key={r.id}
                                                    className="cursor-pointer hover:bg-muted/60"
                                                    onClick={() => {
                                                        router.get(
                                                            examSubmissionDetail.url(
                                                                {
                                                                    exam: exam.id,
                                                                    submission:
                                                                        r.id,
                                                                },
                                                            ),
                                                        );
                                                    }}
                                                >
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">
                                                                {r.user.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {r.user.email}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {r.score}
                                                    </TableCell>
                                                    <TableCell>
                                                        {r.correct_answers} /{' '}
                                                        {r.total_questions}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDuration(
                                                            r.duration_in_seconds,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {dateToReadableString(
                                                            r.submitted_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {r.outdated ? (
                                                            <Badge variant="secondary">
                                                                Herkansen
                                                            </Badge>
                                                        ) : r.score >= 5.5 ? (
                                                            <Badge variant="student">
                                                                Voldoende
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive">
                                                                Onvoldoende
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {r.outdated ? (
                                                            <span className="text-sm text-muted-foreground">
                                                                Toegestaan
                                                            </span>
                                                        ) : r.score >= 5.5 ? (
                                                            <span className="text-sm text-muted-foreground">
                                                                —
                                                            </span>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    router.post(
                                                                        submissionAllowRetake.url(
                                                                            {
                                                                                exam: exam.id,
                                                                                submission:
                                                                                    r.id,
                                                                            },
                                                                        ),
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    );
                                                                }}
                                                            >
                                                                Herkansen
                                                                toestaan
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="xl:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Verdeling</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {summary.total_submissions === 0 ? (
                                <p className="text-muted-foreground">
                                    Geen data beschikbaar.
                                </p>
                            ) : (
                                <ChartContainer
                                    config={chartConfig}
                                    className="mx-auto aspect-square max-h-64 w-full"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel
                                                />
                                            }
                                        />
                                        <Pie
                                            data={passFailData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            labelLine={false}
                                            label={({
                                                cx,
                                                cy,
                                                midAngle = 0,
                                                outerRadius: or,
                                                value,
                                            }) => {
                                                const RADIAN = Math.PI / 180;
                                                const x =
                                                    cx +
                                                    (or + 16) *
                                                        Math.cos(
                                                            -midAngle * RADIAN,
                                                        );
                                                const y =
                                                    cy +
                                                    (or + 16) *
                                                        Math.sin(
                                                            -midAngle * RADIAN,
                                                        );
                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        textAnchor="middle"
                                                        dominantBaseline="central"
                                                        className="fill-primary text-sm font-medium"
                                                    >
                                                        {value}
                                                    </text>
                                                );
                                            }}
                                        />
                                        <ChartLegend
                                            content={
                                                <ChartLegendContent nameKey="name" />
                                            }
                                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                                        />
                                    </PieChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
