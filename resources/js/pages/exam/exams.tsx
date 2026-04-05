import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { Column } from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    BookPlus,
    Trash2Icon,
    MoreHorizontal,
    Pencil,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
    showEdit,
    destroy,
} from '@/actions/App/Http/Controllers/ExamController';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dateToReadableString } from '@/lib/utils';
import { createExam, exams, examResults } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { Exam, PaginatedExams } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Toetsen',
        href: exams(),
    },
];

function SortableHeader({ label }: { label: string }) {
    return ({ column }: { column: Column<Exam> }) => (
        <Button
            variant="ghost"
            className={column.getIsSorted() ? 'bg-accent' : ''}
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
            {label}
            {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
        </Button>
    );
}

export default function Exams() {
    const { exams } = usePage<{ exams: PaginatedExams }>().props;
    const [sorting, setSorting] = useState<SortingState>([]);

    function navigateToPage(url: string | null): void {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    }
    const columns = useMemo<ColumnDef<Exam>[]>(
        () => [
            {
                accessorKey: 'name',
                header: SortableHeader({ label: 'Naam' }),
            },
            {
                accessorKey: 'description',
                header: 'Beschrijving',
            },
            {
                accessorKey: 'active_from',
                header: SortableHeader({ label: 'Actief vanaf' }),
                cell: ({ row }) =>
                    dateToReadableString(row.original.active_from),
            },
            {
                accessorKey: 'active_until',
                header: SortableHeader({ label: 'Actief tot' }),
                cell: ({ row }) =>
                    dateToReadableString(row.original.active_until),
            },
            {
                accessorKey: 'globally_available',
                header: 'Globaal',
                cell: ({ row }) =>
                    row.original.globally_available ? (
                        <Badge className="w-full">Ja</Badge>
                    ) : (
                        <Badge className="w-full" variant="secondary">
                            Nee
                        </Badge>
                    ),
            },
            {
                accessorKey: 'max_mistakes',
                header: SortableHeader({ label: 'Max fouten' }),
            },
            {
                id: 'results',
                header: 'Resultaten',
                cell: ({ row }) => (
                    <Button size="sm" variant="link">
                        <Link href={examResults.url({ exam: row.original.id })}>
                            Resultaten
                        </Link>
                    </Button>
                ),
            },
            {
                accessorKey: 'max_mistakes',
                header: 'acties',
                cell: ({ row }) => <ExamTableRowActions exam={row.original} />,
            },
        ],
        [],
    );

     
    const table = useReactTable({
        data: exams.data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });
    return (
        <AppLayout
            rightContent={
                <>
                    <Button asChild>
                        <Link href={createExam.url()}>
                            <BookPlus /> Nieuwe toets toevoegen
                        </Link>
                    </Button>
                </>
            }
            breadcrumbs={breadcrumbs}
        >
            <Head title="Toetsen" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow
                                    className="hover:bg-none"
                                    key={headerGroup.id}
                                >
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Geen toetsen gevonden.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {exams.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {exams.total} toets(en) — pagina{' '}
                            {exams.current_page} van {exams.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!exams.prev_page_url}
                                onClick={() =>
                                    navigateToPage(exams.prev_page_url)
                                }
                            >
                                Vorige
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!exams.next_page_url}
                                onClick={() =>
                                    navigateToPage(exams.next_page_url)
                                }
                            >
                                Volgende
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function ExamTableRowActions({ exam }: { exam: Exam }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Pencil />
                    <Link href={showEdit(exam.id)}>Bewerken</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => {
                        e.preventDefault();
                        setIsDeleteDialogOpen(true);
                    }}
                >
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete Exam
                </DropdownMenuItem>
            </DropdownMenuContent>

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive">
                            <Trash2Icon />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Delete exam?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure? This will delete {exam.name}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                // Add your delete logic here
                                setIsDeleteDialogOpen(false);
                            }}
                        >
                            <Link
                                href={destroy(exam.id)}
                                method="delete"
                                as="button"
                            >
                                Delete
                            </Link>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DropdownMenu>
    );
}
