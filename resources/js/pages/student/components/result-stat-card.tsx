import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ResultStatCardProps = {
    title: string;
    children: ReactNode;
};

export default function ResultStatCard({
    title,
    children,
}: ResultStatCardProps) {
    return (
        <Card className="flex h-full w-full justify-center border-sidebar-border/70 dark:border-sidebar-border">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-start gap-1 pt-0">
                <span className="text-6xl font-semibold">{children}</span>
            </CardContent>
        </Card>
    );
}
