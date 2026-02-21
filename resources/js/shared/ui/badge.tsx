import { cn } from '@/shared/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
    {
        variants: {
            variant: {
                default: 'bg-brand/10 text-brand-dark dark:bg-brand/25 dark:text-brand',
                success:
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                warning:
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                destructive:
                    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                muted: 'bg-surface text-muted-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface BadgeProps
    extends
        React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
