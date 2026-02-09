import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { RouteName } from 'ziggy-js';
import { route } from '../../vendor/tightenco/ziggy';
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

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: resolvePage,
        setup: ({ App, props }) => {
            /* eslint-disable */
            // @ts-expect-error
            global.route<RouteName> = (name, params, absolute) =>
                route(name, params as any, absolute, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location),
                });
            /* eslint-enable */

            return (
                <AppProviders>
                    <App {...props} />
                </AppProviders>
            );
        },
    }),
);
