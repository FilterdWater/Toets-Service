import { Head } from '@inertiajs/react';
import type { BreadcrumbItem, Exam } from '@/types';
import { makeExam, student } from '@/routes';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Examen" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Label className="text-2xl">{exam.name}</Label>
                <div className='whitespace-pre-wrap' dangerouslySetInnerHTML={{ __html: exam.description }} />
                <div className="self-end">
                    <Button>
                        Start toets <ArrowRight />
                    </Button>
                </div>
            </div>
        </AppHeaderLayout>
    );
}
