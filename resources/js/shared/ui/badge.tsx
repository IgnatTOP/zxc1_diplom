import { cn } from '@/shared/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
    {
        variants: {
            variant: {
                default: 'bg-brand/10 text-brand-dark',
                success: 'bg-emerald-100 text-emerald-700',
                warning: 'bg-amber-100 text-amber-700',
                destructive: 'bg-red-100 text-red-700',
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
