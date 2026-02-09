import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`inline-flex h-11 items-center justify-center rounded-xl border border-transparent bg-brand-dark px-5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand focus:outline-none focus:ring-2 focus:ring-brand/60 focus:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${
                disabled ? 'opacity-60' : ''
            } ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
