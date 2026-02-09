import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { AppProviders } from './app/providers/AppProviders';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const newPages = import.meta.glob('./pages/**/*.tsx');
const legacyPages = import.meta.glob('./Pages/**/*.tsx');

const resolvePage = async (name: string) => {
    const normalized = name.replace(/^\//, '');
    const newPath = `./pages/${normalized}.tsx`;
    const legacyPath = `./Pages/${normalized}.tsx`;

    if (newPages[newPath]) {
        return (await newPages[newPath]()) as { default: unknown };
    }
    if (legacyPages[legacyPath]) {
        return (await legacyPages[legacyPath]()) as { default: unknown };
    }

    throw new Error(`Page not found: ${name}`);
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: resolvePage,
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(
                el,
                <AppProviders>
                    <App {...props} />
                </AppProviders>,
            );
            return;
        }

        createRoot(el).render(
            <AppProviders>
                <App {...props} />
            </AppProviders>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
