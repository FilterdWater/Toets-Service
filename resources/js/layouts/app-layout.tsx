import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps, SharedData } from '@/types';

export default function AppLayout({
    children,
    breadcrumbs,
    ...rest
}: AppLayoutProps) {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...rest}>
            {children}
            <Toaster position="bottom-center" closeButton={true} richColors />
        </AppLayoutTemplate>
    );
}
