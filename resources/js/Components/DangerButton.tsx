import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`inline-flex h-11 items-center justify-center rounded-xl border border-transparent bg-rose-600 px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/60 focus:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${
                disabled ? 'opacity-60' : ''
            } ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
