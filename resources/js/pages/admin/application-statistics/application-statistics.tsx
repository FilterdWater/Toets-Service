import { Head, Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { LabelList, PieChart, Pie } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ChartConfig } from '@/components/ui/chart';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { accounts, applicationStatistics, exams, groups } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Applicatie Statistieken',
        href: applicationStatistics(),
    },
];

const chartConfig = {
    admin: {
        label: 'Beheerders',
        color: 'var(--role-admin)',
    },
    teacher: {
        label: 'Docenten',
        color: 'var(--role-teacher)',
    },
    student: {
        label: 'Studenten',
        color: 'var(--role-student)',
    },
} satisfies ChartConfig;

interface Props {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
    totalExams: number;
    totalGroups: number;
}

export default function ApplicatieStatistieken({
    totalUsers,
    totalStudents,
    totalTeachers,
    totalAdmins,
    totalExams,
    totalGroups,
}: Props) {
    const userDistribution = [
        {
            name: 'Beheerders',
            value: totalAdmins,
            fill: 'var(--role-admin)',
        },
        {
            name: 'Docenten',
            value: totalTeachers,
            fill: 'var(--role-teacher)',
        },
        {
            name: 'Studenten',
            value: totalStudents,
            fill: 'var(--role-student)',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Applicatie Statistieken" />
            <div className="space-y-6 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Link href={accounts()} className="cursor-pointer">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardDescription>
                                        Gebruikers
                                    </CardDescription>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-3xl">
                                    {totalUsers}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href={exams()} className="cursor-pointer">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardDescription>Toetsen</CardDescription>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-3xl">
                                    {totalExams}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href={groups.url()} className="cursor-pointer">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardDescription>Groepen</CardDescription>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-3xl">
                                    {totalGroups}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Gebruikersverdeling</CardTitle>
                        <CardDescription>
                            Verdeling van gebruikers op rol
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={chartConfig}
                            className="mx-auto aspect-square max-h-62.5"
                        >
                            <PieChart>
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            nameKey="value"
                                            hideLabel
                                        />
                                    }
                                />
                                <Pie
                                    data={userDistribution}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    <LabelList
                                        dataKey="name"
                                        className="fill-background"
                                        stroke="none"
                                        fontSize={12}
                                        formatter={(value) => value}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
