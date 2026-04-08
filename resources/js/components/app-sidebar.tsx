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
    admin,
    teacher,
} from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role as string | undefined;
    const mainNavItems: NavItem[] = [
        {
            title: 'Accounts',
            href: accounts(),
            icon: User,
            isVisible: auth.user.role === Role.Admin,
        },
        {
            title: 'Applicatie Statistieken',
            href: applicationStatistics(),
            icon: PieChart,
            isVisible: auth.user.role === Role.Admin,
        },
        {
            title: 'Groepen',
            href: groups.url(),
            icon: Users,
            isVisible:
                auth.user.role === Role.Teacher ||
                auth.user.role === Role.Admin,
        },
        {
            title: 'Toetsen',
            href: exams(),
            icon: LibraryBig,
            isVisible:
                auth.user.role === Role.Teacher ||
                auth.user.role === Role.Admin,
        },
    ];

    const homeHref =
        role === Role.Student
            ? student()
            : role === Role.Teacher
              ? teacher()
              : role === Role.Admin
                ? admin() // TODO: Use the application statistics page instead
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
