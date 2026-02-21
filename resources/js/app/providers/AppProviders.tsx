import { InitialPageLoader } from '@/app/providers/InitialPageLoader';
import { NavigationProgressOverlay } from '@/app/providers/NavigationProgressOverlay';
import {
    initTheme,
    subscribeToSystemThemeChange,
} from '@/shared/lib/theme';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

export function AppProviders({ children }: PropsWithChildren) {
    useEffect(() => {
        initTheme();
        return subscribeToSystemThemeChange(() => {
            // Theme is reapplied inside subscribeToSystemThemeChange.
        });
    }, []);

    return (
        <>
            <NavigationProgressOverlay />
            <InitialPageLoader />
            {children}
        </>
    );
}
