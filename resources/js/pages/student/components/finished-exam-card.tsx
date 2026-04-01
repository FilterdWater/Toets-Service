import { router } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardTitle,
} from '@/components/ui/card';
import { dateToReadableString } from '@/lib/utils';
import { showResult } from '@/routes';
import type { Exam } from '@/types';

type FinishedExamCardProps = {
    exam: Exam;
};

export default function FinishedExamCard({ exam }: FinishedExamCardProps) {
    return (
        <Card
            onClick={() => router.visit(showResult.url({ id: exam.id }))}
            className="flex max-w-72 min-w-72 cursor-pointer flex-col transition-all hover:shadow-lg hover:ring-1 hover:shadow-primary/10 hover:ring-border dark:hover:shadow-primary/10"
        >
            <CardContent className="flex-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                </div>
                <CardDescription>{exam.description}</CardDescription>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
                Gemaakt op: {dateToReadableString(exam.submitted_at)}
            </CardFooter>
        </Card>
    );
}
