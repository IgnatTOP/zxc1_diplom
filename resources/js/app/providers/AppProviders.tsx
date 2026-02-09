import { InitialPageLoader } from '@/app/providers/InitialPageLoader';
import { NavigationProgressOverlay } from '@/app/providers/NavigationProgressOverlay';
import type { PropsWithChildren } from 'react';

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <>
            <NavigationProgressOverlay />
            <InitialPageLoader />
            {children}
        </>
    );
}
