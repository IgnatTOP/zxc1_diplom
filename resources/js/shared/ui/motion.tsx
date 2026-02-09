import { cn } from '@/shared/lib/utils';
import type { CSSProperties, PropsWithChildren } from 'react';

type PageTransitionProps = PropsWithChildren<{
    className?: string;
    pageKey?: string;
}>;

type RevealProps = PropsWithChildren<{
    className?: string;
    delayMs?: number;
}>;

type StaggerProps = PropsWithChildren<{
    className?: string;
}>;

export function PageTransition({
    children,
    className,
    pageKey,
}: PageTransitionProps) {
    return (
        <div key={pageKey} className={cn('dw-page-enter', className)}>
            {children}
        </div>
    );
}

export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
    return (
        <div
            className={cn('dw-fade-up', className)}
            style={{ '--dw-delay': `${delayMs}ms` } as CSSProperties}
        >
            {children}
        </div>
    );
}

export function Stagger({ children, className }: StaggerProps) {
    return <div className={cn('dw-stagger', className)}>{children}</div>;
}
