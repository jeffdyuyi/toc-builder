import type { ReactNode } from 'react';

export function GoldCard({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`border-[3px] border-[#daaa39] outline outline-1 outline-offset-[3px] outline-[#daaa39] bg-white/50 shadow-sm relative ${className}`}>
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#daaa39]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#daaa39]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#daaa39]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#daaa39]" />
            {children}
        </div>
    );
}

export default function DualPage({ left, right }: { left: ReactNode; right: ReactNode }) {
    return (
        <div className="flex w-full min-h-[800px]">
            <div className="w-1/2 p-5 pr-4 border-r-2 border-[#daaa39]/30 flex flex-col gap-4">
                {left}
            </div>
            <div className="w-1/2 p-5 pl-4 flex flex-col gap-4">
                {right}
            </div>
        </div>
    );
}
