import { Link, usePage } from '@inertiajs/react';
import { User, Users, LibraryBig } from 'lucide-react';
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
import { accounts, groups, login, exams } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [];

export function AppSidebar() {
    //TODO: Add rol specific items
    const mainNavItems: NavItem[] = [
        {
            title: 'Groepen',
            href: groups.url(),
            icon: Users,
        },
        {
            title: 'Accounts',
            href: accounts(),
            icon: User,
        },
        {
            title: 'Toetsen',
            href: exams(),
            icon: LibraryBig,
        },
    ];
    const { auth } = usePage().props;
    const role = auth.user?.role as string | undefined;

    //TODO: Refactor to use role enum & use inertia links
    const homeHref =
        role === 'student'
            ? '/student'
            : role === 'teacher'
              ? '/docent'
              : role === 'admin'
                ? '/beheerder'
                : //TODO: Add 403 page
                  login();

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
