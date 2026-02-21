import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                background: 'rgb(var(--background) / <alpha-value>)',
                foreground: 'rgb(var(--foreground) / <alpha-value>)',
                card: 'rgb(var(--card) / <alpha-value>)',
                'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
                surface: 'rgb(var(--surface) / <alpha-value>)',
                muted: 'rgb(var(--muted) / <alpha-value>)',
                border: 'rgb(var(--border) / <alpha-value>)',
                'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
                brand: 'rgb(var(--brand) / <alpha-value>)',
                'brand-dark': 'rgb(var(--brand-dark) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['Manrope', ...defaultTheme.fontFamily.sans],
                title: ['Unbounded', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
