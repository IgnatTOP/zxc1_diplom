import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={`inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/60 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                disabled ? 'opacity-60' : ''
            } ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
