import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, BookPlus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
export default function Exams() {
    const { exams } = usePage<{ exams: PaginatedExams }>().props;
    const [sorting, setSorting] = useState<SortingState>([]);
    const columns = useMemo<ColumnDef<Exam>[]>(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Naam
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                accessorKey: 'description',
                header: 'Beschrijving',
            },
            {
                accessorKey: 'active_from',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Actief vanaf
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) =>
                    dateToReadableString(row.original.active_from),
            },
            {
                accessorKey: 'active_until',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Actief tot
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
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
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Max fouten
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'results',
                header: '',
                cell: ({ row }) => (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            router.visit(
                                examResults.url({ exam: row.original.id }),
                            )
                        }
                    >
                        Resultaten
                    </Button>
                ),
            },
        ],
        [],
    );

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: exams.data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
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
                {/* Pagination */}
                <div className="flex flex-row justify-start gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Vorige pagina
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Volgende pagina
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
