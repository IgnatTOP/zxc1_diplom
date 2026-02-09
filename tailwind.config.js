import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                background: '#fcfafb',
                foreground: '#2f2f35',
                card: '#ffffff',
                'card-foreground': '#2f2f35',
                surface: '#edf3f7',
                border: '#d6e1ea',
                'muted-foreground': '#5f6a73',
                brand: '#7db8d5',
                'brand-dark': '#5a9dbf',
            },
            fontFamily: {
                sans: ['Manrope', ...defaultTheme.fontFamily.sans],
                title: ['Unbounded', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
