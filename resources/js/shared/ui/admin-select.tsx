import { cn } from '@/shared/lib/utils';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

export interface AdminSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    ref={ref}
                    className={cn(
                        'flex h-11 w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50',
                        className,
                    )}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
        );
    },
);
AdminSelect.displayName = 'AdminSelect';

export { AdminSelect };
