import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { dateToReadableString, formatDuration } from '@/lib/utils';
import ResultStatCard from '@/pages/student/components/result-stat-card';
import { student } from '@/routes';
import type { Exam } from '@/types';

type ExamResultProps = {
    exam: Exam;
    result: {
        total_questions: number;
        correct_answers: number;
        submitted_at: string | null;
        duration_in_seconds: number | null;
        has_submission: boolean;
    };
};

const chartConfig = {
    correct: {
        label: 'Goed',
        color: 'var(--color-green-500)',
    },
    incorrect: {
        label: 'Fout',
        color: 'var(--color-red-500)',
    },
} satisfies ChartConfig;

export default function ExamResult({ exam, result }: ExamResultProps) {
    const scoreData = [
        {
            name: 'correct',
            value: result.correct_answers,
            fill: 'var(--color-green-500)',
        },
        {
            name: 'incorrect',
            value: result.total_questions - result.correct_answers,
            fill: 'var(--color-red-500)',
        },
    ];

    return (
        <AppHeaderLayout>
            <Head title={`Resultaat - ${exam.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Button
                    className="self-start"
                    variant="outline"
                    onClick={() => router.visit(student.url())}
                >
                    <ArrowLeft />
                    Terug naar toetsenlijst
                </Button>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* exam details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {exam.name}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-4 md:flex-row">
                            <div className="flex flex-1 flex-col gap-2 pl-2">
                                <p>{exam.description}</p>
                                <p>
                                    Gemaakt op:{' '}
                                    {dateToReadableString(result.submitted_at)}
                                </p>
                                {exam.sections && exam.sections.length > 0 && (
                                    <>
                                        <Label className="text-lg">
                                            Secties
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {exam.sections.map((section) => (
                                                <Badge
                                                    key={section.id}
                                                    variant="secondary"
                                                >
                                                    {section.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Resultaat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* result chart */}
                            <div className="w-full md:flex-1">
                                <ChartContainer
                                    config={chartConfig}
                                    className="mx-auto aspect-square max-h-75 w-full"
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
                                            data={scoreData}
                                            dataKey="value"
                                            nameKey="name"
                                            labelLine={false}
                                            label={({ payload, ...props }) => (
                                                <text
                                                    cx={props.cx}
                                                    cy={props.cy}
                                                    x={props.x}
                                                    y={props.y}
                                                    textAnchor={
                                                        props.textAnchor
                                                    }
                                                    dominantBaseline={
                                                        props.dominantBaseline
                                                    }
                                                    className="fill-primary"
                                                >
                                                    {payload.value}
                                                </text>
                                            )}
                                        />
                                        <ChartLegend
                                            content={
                                                <ChartLegendContent nameKey="name" />
                                            }
                                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                                        />
                                    </PieChart>
                                </ChartContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <ResultStatCard title="Score">
                        {result.total_questions > 0
                            ? (
                                  (result.correct_answers /
                                      result.total_questions) *
                                  10
                              ).toFixed(1)
                            : '0.0'}

                        <span className="relative -top-1 pl-2 text-xs text-muted-foreground">
                            {result.correct_answers >=
                            result.total_questions * 0.55 ? (
                                <Badge variant="student">Voldoende</Badge>
                            ) : (
                                <Badge variant="admin">Onvoldoende</Badge>
                            )}
                        </span>
                    </ResultStatCard>

                    <ResultStatCard title="Resultaat">
                        {result.correct_answers} / {result.total_questions}{' '}
                        <span className="text-xs text-muted-foreground">
                            zijn goed beantwoord
                        </span>
                    </ResultStatCard>

                    <ResultStatCard title="Tijdsduur">
                        {formatDuration(result.duration_in_seconds)}
                    </ResultStatCard>
                </div>
            </div>
        </AppHeaderLayout>
    );
}
