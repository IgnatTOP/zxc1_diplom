import { useEffect, useState } from 'react';

type Phase = 'visible' | 'hiding' | 'hidden';

export function InitialPageLoader() {
    const [phase, setPhase] = useState<Phase>('visible');

    useEffect(() => {
        const hideTimer = window.setTimeout(() => setPhase('hiding'), 340);
        const unmountTimer = window.setTimeout(() => setPhase('hidden'), 760);

        return () => {
            window.clearTimeout(hideTimer);
            window.clearTimeout(unmountTimer);
        };
    }, []);

    if (phase === 'hidden') {
        return null;
    }

    return (
        <div
            className={`pointer-events-none fixed inset-0 z-[95] flex items-center justify-center bg-background/95 transition-opacity duration-500 ${
                phase === 'visible' ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div className="dw-scale-in rounded-2xl border border-brand/30 bg-white/85 px-6 py-5 text-center shadow-xl backdrop-blur">
                <p className="font-title text-lg font-bold text-brand-dark">
                    DanceWave
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Загрузка
                </p>
                <div className="mx-auto mt-3 h-1.5 w-24 overflow-hidden rounded-full bg-brand/15">
                    <div className="dw-nav-loader h-full w-full" />
                </div>
            </div>
        </div>
    );
}
