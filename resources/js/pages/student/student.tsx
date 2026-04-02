import { Head } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AvailableExamCard from '@/pages/student/components/available-exam-card';
import FinishedExamCard from '@/pages/student/components/finished-exam-card';
import type { Exam } from '@/types';

type StudentPageProps = {
    availableExams: Exam[];
    finishedExams: Exam[];
};

export default function Student({
    availableExams,
    finishedExams,
}: StudentPageProps) {
    return (
        <AppHeaderLayout>
            <Head title="Student" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Label className="text-lg">Beschikbare toetsen</Label>
                <Card className="w-full overflow-x-auto p-4">
                    <div className="flex flex-row space-x-4 pb-4">
                    {availableExams.length === 0 ? (
                        <div className='items-center font-bold'>Geen beschikbare examens gevonden</div>
                    ) : (
                        availableExams.map((exam) => (
                            <AvailableExamCard key={exam.id} exam={exam} />
                        ))
                    )}
                    </div>
                </Card>
                <Label className="text-lg">Toetsen afgerond</Label>
                <Card className={`w-full ${finishedExams.length > 0 ? 'cursor-pointer' : ''} overflow-x-auto p-4`}>
                    <div className="flex flex-row space-x-4 pb-4">
                        {finishedExams.length === 0 ? (
                            <div className='items-center font-bold'>Geen gemaakte examens gevonden</div>
                        ) : (
                            finishedExams.map((exam) => (
                                <FinishedExamCard key={exam.id} exam={exam} />
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </AppHeaderLayout>
    );
}
