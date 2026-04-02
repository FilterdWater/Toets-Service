import { Head, router, Link, usePage } from '@inertiajs/react';
import { ImportIcon, UserRoundPlus, UserRoundPen } from 'lucide-react';
import { useRef, useState } from 'react';
import AlertError from '@/components/alert-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Table,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dateToReadableString, roleToReadableString } from '@/lib/utils';
import type { RoleFilter } from '@/pages/admin/components/rol-selector';
import RolSelector, {
    SelectorMode,
} from '@/pages/admin/components/rol-selector';
import { accountCreate, accountEdit, accountImport, accounts } from '@/routes';
import type { BreadcrumbItem, PaginatedUsers, User } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: accounts(),
    },
];

type AccountsPageProps = {
    users: PaginatedUsers;
    selectedRole: RoleFilter;
};

export default function Account() {
    const { users, selectedRole } = usePage<AccountsPageProps>().props;
    const [importResponse, setImportResponse] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const csvInputRef = useRef<HTMLInputElement | null>(null);

    function openCsvPicker(): void {
        setImportResponse(null);
        if (csvInputRef.current) {
            csvInputRef.current.value = '';
        }
        csvInputRef.current?.click();
    }

    async function importCsv(file: File): Promise<void> {
        const formData = new FormData();
        formData.append('csv', file);

        router.post(accountImport.url(), formData, {
            forceFormData: true,
            onStart: () => setImportResponse(null),
            onSuccess: () => {
                setIsImportOpen(false);
            },
            onError: (errors) => {
                const messages = Object.values(errors).flatMap((value) =>
                    Array.isArray(value) ? value : [value],
                );
                setImportResponse({
                    success: false,
                    message: messages.join('\n') || 'CSV import mislukt.',
                });
            },
        });
    }

    function handleRoleChange(role: RoleFilter): void {
        router.get(accounts.url(), role === 'all' ? {} : { role }, {
            preserveState: true,
        });
    }

    function navigateToPage(url: string | null): void {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    }

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            rightContent={
                <>
                    <div className="hidden gap-2 md:flex">
                        <Button onClick={() => setIsImportOpen(true)}>
                            <ImportIcon /> Importeer account(s)
                        </Button>
                        <Button asChild>
                            <Link href={accountCreate.url()}>
                                <UserRoundPlus /> Creëer account
                            </Link>
                        </Button>
                    </div>
                    <div className="block md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Importeer of Creëer
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup className="flex flex-col gap-2 p-2">
                                    <DropdownMenuItem asChild>
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                setIsImportOpen(true)
                                            }
                                        >
                                            <ImportIcon /> Importeer account(s)
                                        </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Button asChild>
                                            <Link href={accountCreate.url()}>
                                                <UserRoundPlus /> Creëer account
                                            </Link>
                                        </Button>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </>
            }
        >
            <Head title="Account" />
            <div className="flex h-full flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Naam</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="flex items-center gap-2">
                                Rol
                                <RolSelector
                                    value={selectedRole}
                                    placeholder="Filter op rol"
                                    mode={SelectorMode.Filter}
                                    onValueChange={handleRoleChange}
                                />
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Gemaakt op</TableHead>
                            <TableHead>Laatst bijgewerkt op</TableHead>
                            <TableHead>Acties</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.map((user: User) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role}>
                                        {roleToReadableString(user.role)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            user.is_active
                                                ? 'active'
                                                : 'destructive'
                                        }
                                    >
                                        {user.is_active
                                            ? 'Actief'
                                            : 'Gedeactiveerd'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono tabular-nums">
                                    {dateToReadableString(user.created_at)}
                                </TableCell>
                                <TableCell className="font-mono tabular-nums">
                                    {dateToReadableString(user.updated_at)}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Button asChild>
                                        <Link href={accountEdit.url(user.id)}>
                                            <UserRoundPen /> Wijzig
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {users.total} account(s) — pagina{' '}
                            {users.current_page} van {users.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!users.prev_page_url}
                                onClick={() =>
                                    navigateToPage(users.prev_page_url)
                                }
                            >
                                Vorige
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!users.next_page_url}
                                onClick={() =>
                                    navigateToPage(users.next_page_url)
                                }
                            >
                                Volgende
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Import Dialog */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Importeer accounts</DialogTitle>
                        <DialogDescription>
                            Hieronder kun je een CSV file uploaden met de
                            accounts die je wilt importeren.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {importResponse?.success === false && (
                            <AlertError errors={[importResponse.message]} />
                        )}
                        {importResponse?.success === true && (
                            <Alert>
                                <AlertTitle>Succes</AlertTitle>
                                <AlertDescription>
                                    {importResponse.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Voorbeeld CSV</p>
                            <pre className="max-h-48 overflow-auto rounded-md border bg-muted p-3 font-mono text-xs">
                                {`name,email,password,role
Alice,alice@example.com,Password123!,student
Bob,bob@example.com,Password123!,teacher`}
                            </pre>
                        </div>

                        <input
                            ref={csvInputRef}
                            type="file"
                            accept=".csv,text/csv"
                            className="absolute h-px w-px opacity-0"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) {
                                    return;
                                }

                                void importCsv(file);
                                if (csvInputRef.current) {
                                    csvInputRef.current.value = '';
                                }
                            }}
                        />

                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button onClick={openCsvPicker}>Upload CSV</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
