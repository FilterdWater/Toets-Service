// import type { ReactNode} from 'react';
// import React, { useContext, useState, createContext } from 'react';
// import type { Exam } from '@/types';
//
// type ExamContextType = {
//     exam: Exam;
//     setExam: React.Dispatch<React.SetStateAction<Exam>>;
// };
//
// const ExamContext = createContext<ExamContextType | undefined>(undefined);
//
// export function ExamProvider({
//     children,
//     initialExam,
// }: {
//     children: ReactNode;
//     initialExam: Exam;
// }) {
//     const [exam, setExam] = useState(initialExam);
//
//     return (
//         <ExamContext.Provider value={{ exam, setExam }}>
//             {children}
//         </ExamContext.Provider>
//     );
// }
//
// export function useExam() {
//     const context = useContext(ExamContext);
//     if (!context)
//         throw new Error('useExam must be used within an ExamProvider');
//     return context;
// }

// DONT DELETE I MIGHT WANT TO USE THIS
