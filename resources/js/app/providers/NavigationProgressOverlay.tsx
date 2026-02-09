import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export function NavigationProgressOverlay() {
    const [active, setActive] = useState(false);
    const startTimerRef = useRef<number | null>(null);
    const finishTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const clearTimers = () => {
            if (startTimerRef.current !== null) {
                window.clearTimeout(startTimerRef.current);
                startTimerRef.current = null;
            }

            if (finishTimerRef.current !== null) {
                window.clearTimeout(finishTimerRef.current);
                finishTimerRef.current = null;
            }
        };

        const handleStart = () => {
            if (finishTimerRef.current !== null) {
                window.clearTimeout(finishTimerRef.current);
                finishTimerRef.current = null;
            }

            if (startTimerRef.current !== null) {
                window.clearTimeout(startTimerRef.current);
            }

            startTimerRef.current = window.setTimeout(() => {
                setActive(true);
                startTimerRef.current = null;
            }, 80);
        };

        const handleDone = () => {
            if (startTimerRef.current !== null) {
                window.clearTimeout(startTimerRef.current);
                startTimerRef.current = null;
            }

            if (finishTimerRef.current !== null) {
                window.clearTimeout(finishTimerRef.current);
            }

            finishTimerRef.current = window.setTimeout(() => {
                setActive(false);
                finishTimerRef.current = null;
            }, 140);
        };

        const offStart = router.on('start', handleStart);
        const offFinish = router.on('finish', handleDone);
        const offError = router.on('error', handleDone);
        const offInvalid = router.on('invalid', handleDone);
        const offException = router.on('exception', handleDone);

        return () => {
            clearTimers();
            offStart();
            offFinish();
            offError();
            offInvalid();
            offException();
        };
    }, []);

    return (
        <div
            className={`pointer-events-none fixed inset-x-0 top-0 z-[90] h-1 transition-opacity duration-200 ${
                active ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div className="dw-nav-loader h-full w-full" />
        </div>
    );
}
