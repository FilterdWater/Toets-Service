import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { showExam } from '@/routes';
import type { Exam } from '@/types';

type StudentPageProps = {
    availableExams: Exam[];
    finishedExams: Exam[];
};

export default function Student({
    availableExams,
    finishedExams,
}: StudentPageProps) {
    return (
        <AppHeaderLayout>
            <Head title="Student" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Label className="text-lg">Beschikbare toetsen</Label>
                <Card className="w-full overflow-x-auto p-4">
                    <div className="flex flex-row space-x-4">
                        {availableExams.map((e) => (
                            <Card
                                key={e.id}
                                className="flex max-w-72 min-w-72 flex-col"
                            >
                                <CardContent>
                                    <CardTitle>{e.name}</CardTitle>
                                </CardContent>
                                <CardFooter className="mt-auto flex justify-end">
                                    <Button asChild>
                                        <Link href={showExam.url({ id: e.id })}>
                                            Start toets
                                        </Link>
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
                        {finishedExams.length === 0 &&
                            'Geen gemaakte examens gevonden'}
                    </div>
                </Card>
            </div>
        </AppHeaderLayout>
    );
}
