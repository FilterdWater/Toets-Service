import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldLabel } from '@/components/ui/field';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerWithRangeProps {
    className?: string;
    selected?: DateRange;
    onSelect?: (date: DateRange | undefined) => void;
    label?: string;
}

export function DatePickerWithRange({
    className,
    selected,
    onSelect,
    label = 'Date Picker Range',
}: DatePickerWithRangeProps) {
    return (
        <Field className={cn('w-60', className)}>
            <FieldLabel htmlFor="date-picker-range">{label}</FieldLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date-picker-range"
                        className="w-full justify-start px-2.5 font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selected?.from ? (
                            selected.to ? (
                                <>
                                    {format(selected.from, 'LLL dd, y')} -{' '}
                                    {format(selected.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(selected.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        defaultMonth={selected?.from}
                        selected={selected}
                        onSelect={onSelect}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </Field>
    );
}
