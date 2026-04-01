import { router } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
} from '@/components/ui/card';
import { dateToReadableString } from '@/lib/utils';
import { showExam } from '@/routes';
import type { Exam } from '@/types';

type AvailableExamCardProps = {
    exam: Exam;
};

export default function AvailableExamCard({ exam }: AvailableExamCardProps) {
    return (
        <Card
            onClick={() => router.visit(showExam.url({ id: exam.id }))}
            className="flex max-w-72 min-w-72 cursor-pointer flex-col transition-all hover:shadow-lg hover:ring-1 hover:shadow-black/5 hover:ring-border dark:hover:shadow-white/10"
        >
            <CardContent className="flex-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                </div>
                <CardDescription>{exam.description}</CardDescription>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
                Van: {dateToReadableString(exam.active_from)}
                <br />
                Tot: {dateToReadableString(exam.active_until)}
            </CardFooter>
        </Card>
    );
}
