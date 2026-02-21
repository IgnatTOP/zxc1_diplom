import { cn } from '@/shared/lib/utils';
import * as React from 'react';

/* ------------------------------------------------------------------ */
/*  Column definition                                                  */
/* ------------------------------------------------------------------ */

export type AdminColumn<T> = {
    /** Unique key used as React key */
    key: string;
    /** Column header label */
    label: string;
    /** Render the cell value */
    render: (row: T) => React.ReactNode;
    /** If true the column is hidden on mobile cards (actions, etc.) */
    hideOnCard?: boolean;
    /** Extra className for the <td> */
    className?: string;
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

type Props<T> = {
    columns: AdminColumn<T>[];
    data: T[];
    /** Unique key extractor */
    rowKey: (row: T) => string | number;
    /** Optional: render custom actions row in the mobile card */
    renderCardActions?: (row: T) => React.ReactNode;
    /** Extra className for the wrapper */
    className?: string;
    /** Empty-state message */
    emptyMessage?: string;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminTable<T>({
    columns,
    data,
    rowKey,
    renderCardActions,
    className,
    emptyMessage = 'Нет данных',
}: Props<T>) {
    if (data.length === 0) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={cn(className)}>
            {/* ── Desktop table ── */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr
                                key={rowKey(row)}
                                className="border-b border-border/50 transition-colors hover:bg-brand/5"
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={cn(
                                            'px-4 py-3 align-top',
                                            col.className,
                                        )}
                                    >
                                        {col.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile cards ── */}
            <div className="flex flex-col gap-3 md:hidden">
                {data.map((row) => (
                    <div
                        key={rowKey(row)}
                        className="rounded-xl border border-border bg-card p-4 shadow-sm"
                    >
                        <dl className="space-y-2 text-sm">
                            {columns
                                .filter((c) => !c.hideOnCard)
                                .map((col) => (
                                    <div
                                        key={col.key}
                                        className="flex items-start justify-between gap-2"
                                    >
                                        <dt className="shrink-0 font-medium text-muted-foreground">
                                            {col.label}
                                        </dt>
                                        <dd className="text-right">
                                            {col.render(row)}
                                        </dd>
                                    </div>
                                ))}
                        </dl>

                        {renderCardActions && (
                            <div className="mt-3 flex flex-wrap gap-2 border-t border-border/50 pt-3">
                                {renderCardActions(row)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
