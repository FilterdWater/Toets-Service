import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { exams } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Toetsen',
        href: exams(),
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div>Hello world</div>
        </AppLayout>
    );
}
