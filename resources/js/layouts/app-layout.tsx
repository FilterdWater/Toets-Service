import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { Role } from '@/enums/role';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps, SharedData } from '@/types';

export default function AppLayout({
    children,
    breadcrumbs,
    ...rest
}: AppLayoutProps) {
    const { auth, flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    if (auth.user.role === Role.Student) {
        return (
            <AppHeaderLayout breadcrumbs={breadcrumbs} {...rest}>
                {children}
            </AppHeaderLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs} {...rest}>
            {children}
            <Toaster position="bottom-center" closeButton={true} richColors />
        </AppSidebarLayout>
    );
}
