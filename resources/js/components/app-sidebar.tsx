import { Link, usePage } from '@inertiajs/react';
import { User, Users, LibraryBig, PieChart } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Role } from '@/enums/role';
import {
    accounts,
    applicationStatistics,
    groups,
    exams,
    student,
    teacher,
    admin,
} from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    //TODO: Add rol specific items
    const mainNavItems: NavItem[] = [
        {
            title: 'Accounts',
            href: accounts(),
            icon: User,
        },
        {
            title: 'Applicatie Statistieken',
            href: applicationStatistics(),
            icon: PieChart,
        },
        {
            title: 'Groepen',
            href: groups.url(),
            icon: Users,
        },
        {
            title: 'Toetsen',
            href: exams(),
            icon: LibraryBig,
        },
    ];
    const { auth } = usePage().props;
    const role = auth.user?.role as string | undefined;

    const homeHref =
        role === Role.Student
            ? student()
            : role === Role.Teacher
              ? teacher()
              : role === Role.Admin
                ? admin()
                : '#';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
