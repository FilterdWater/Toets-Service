import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { applicationStatistics } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Applicatie Statistieken',
        href: applicationStatistics(),
    },
];

export default function ApplicatieStatistieken() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Applicatie Statistieken" />
            <div className="p-4">Applicatie Statistieken</div>
        </AppLayout>
    );
}
