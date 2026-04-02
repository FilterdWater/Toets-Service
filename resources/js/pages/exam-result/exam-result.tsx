import { Head } from '@inertiajs/react';
import { Pie, PieChart } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Label } from '@/components/ui/label';
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
import { exams, examResults } from '@/routes';
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
    backUrl?: string | null;
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
    backUrl,
}: ExamResultProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Toetsen', href: backUrl ?? exams() },
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">{exam.name}</h1>
                {exam.description && (
                    <p className="text-muted-foreground">{exam.description}</p>
                )}

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

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Resultaten per student</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {results.length === 0 ? (
                                <p className="text-muted-foreground">
                                    Nog geen inzendingen.
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Goed / Totaal</TableHead>
                                            <TableHead>Tijdsduur</TableHead>
                                            <TableHead>Ingeleverd</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.map((r) => (
                                            <TableRow key={r.id}>
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
                                                    {r.score >= 5.5 ? (
                                                        <Badge variant="student">
                                                            Voldoende
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            Onvoldoende
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Verdeling</CardTitle>
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

                {exam.sections && exam.sections.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <Label>Secties:</Label>
                        {exam.sections.map((section) => (
                            <Badge key={section.id} variant="secondary">
                                {section.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
