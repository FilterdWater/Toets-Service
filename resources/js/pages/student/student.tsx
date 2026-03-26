import { Head, router } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem, Exam } from '@/types';
import { makeExam, student } from '@/routes';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type StudentPageProps = {
    availableExams: Exam[];
    finishedExams: Exam[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Student',
        href: student.url(),
    },
];

export default function Student({
    availableExams,
    finishedExams,
}: StudentPageProps) {
    console.log('availableExams: ', availableExams);
    console.log('finishedExams: ', finishedExams);
    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Student" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Label className="text-lg">Beschikbare toetsen</Label>
                <Card className="w-full overflow-x-auto p-4">
                    <div className="flex flex-row space-x-4">
                        {availableExams.slice(0, 5).map((e) => (
                            <Card
                                key={e.id}
                                className="flex max-w-72 min-w-72 flex-col"
                            >
                                <CardContent>
                                    <CardTitle>{e.name}</CardTitle>
                                </CardContent>
                                <CardFooter className="mt-auto flex justify-end">
                                    <Button
                                        onClick={() =>
                                            router.visit(
                                                makeExam.url({ id: e.id }),
                                            )
                                        }
                                    >
                                        Start toets
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </Card>
                <Label className="text-lg">Toetsen afgerond</Label>
                <Card className="w-full overflow-x-auto p-4">
                    <div className="flex flex-row space-x-4">
                        {finishedExams.slice(0, 5).map((fe) => (
                            <Card
                                key={fe.id}
                                className="flex max-w-72 min-w-72 flex-col"
                            >
                                <CardContent>
                                    <CardTitle>{fe.name}</CardTitle>
                                </CardContent>
                                <CardFooter className="mt-auto flex justify-end">
                                    <Button>Bekijk resultaat</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </Card>
            </div>
        </AppHeaderLayout>
    );
}
