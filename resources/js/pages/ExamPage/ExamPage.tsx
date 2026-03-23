import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';


export default function ExamPage() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Exam',
            href: '',
        }
    ];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-row gap-4">
                <div>
                    <div className="rounded-lg border">voeg niuewe </div>
                </div>
                <div>
                    <div>Toets titel</div>
                    <div>test description</div>
                    <Button variant="destructive">Delete</Button>
                </div>
            </div>
        </AppLayout>
    );
}
