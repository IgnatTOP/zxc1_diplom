import { mediaUrl } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import {
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Layers,
    Maximize2,
    Minus,
    Plus,
    RotateCcw,
    Sparkles,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

type GalleryItem = {
    id: number;
    filename: string;
    title?: string | null;
    alt_text?: string | null;
};

type CollageItem = {
    id: number;
    title: string;
    main_image: string;
    photos?: string[] | null;
    photo_count?: number;
};

type Props = {
    items: GalleryItem[];
    collages: CollageItem[];
    meta?: { title?: string; description?: string; canonical?: string };
};

type LightboxImage = { src: string; title: string };

export default function Gallery({ items, collages, meta }: Props) {
    const allImages = useMemo<LightboxImage[]>(() => {
        const result: LightboxImage[] = [];
        for (const item of items) {
            const url = mediaUrl(item.filename);
            if (url) result.push({ src: url, title: item.title || '' });
        }
        for (const collage of collages) {
            const main = mediaUrl(collage.main_image);
            if (main) result.push({ src: main, title: collage.title });
            for (const photo of collage.photos || []) {
                const url = mediaUrl(photo);
                if (url) result.push({ src: url, title: collage.title });
            }
        }
        return result;
    }, [items, collages]);

    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Zoom & pan state
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

    const resetView = useCallback(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    const openLightbox = useCallback(
        (index: number) => {
            setCurrentIndex(index);
            resetView();
            setIsOpen(true);
        },
        [resetView],
    );

    const navigate = useCallback(
        (dir: -1 | 1) => {
            setCurrentIndex(
                (prev) => (prev + dir + allImages.length) % allImages.length,
            );
            resetView();
        },
        [allImages.length, resetView],
    );

    // Keyboard
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
            if (e.key === '+' || e.key === '=')
                setScale((s) => Math.min(s + 0.25, 4));
            if (e.key === '-')
                setScale((s) => Math.max(s - 0.25, 0.5));
            if (e.key === '0') resetView();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, navigate, resetView]);

    // Mouse wheel zoom
    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            e.preventDefault();
            setScale((s) =>
                Math.min(4, Math.max(0.5, s + (e.deltaY > 0 ? -0.15 : 0.15))),
            );
        },
        [],
    );

    // Drag to pan
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (scale <= 1) return;
            setIsDragging(true);
            dragStart.current = {
                x: e.clientX,
                y: e.clientY,
                ox: offset.x,
                oy: offset.y,
            };
        },
        [scale, offset],
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isDragging) return;
            setOffset({
                x: dragStart.current.ox + (e.clientX - dragStart.current.x),
                y: dragStart.current.oy + (e.clientY - dragStart.current.y),
            });
        },
        [isDragging],
    );

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    const current = allImages[currentIndex];

    return (
        <SiteLayout meta={meta}>
            {/* ─── Hero ─── */}
            <Reveal>
                <section className="relative overflow-hidden rounded-3xl border border-brand/20 p-8 lg:p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/12 via-brand/5 to-transparent" />
                    <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-brand/10 blur-[80px]" />
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <Badge variant="default" className="mb-4">
                                <ImageIcon className="mr-1 h-3 w-3" />
                                Галерея
                            </Badge>
                            <h1 className="font-title text-3xl font-bold lg:text-4xl">
                                Моменты{' '}
                                <span className="bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent">
                                    DanceWave
                                </span>
                            </h1>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                Фотографии с занятий, отчётных концертов и
                                мероприятий студии
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Badge variant="muted">
                                <ImageIcon className="mr-1 h-3 w-3" />
                                Фото: {items.length}
                            </Badge>
                            <Badge variant="muted">
                                <Layers className="mr-1 h-3 w-3" />
                                Коллажи: {collages.length}
                            </Badge>
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* ─── Collages ─── */}
            {collages.length > 0 && (
                <Reveal className="mt-8">
                    <p className="dw-kicker mb-4">Коллажи</p>
                    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {collages.map((collage) => {
                            const mainSrc = mediaUrl(collage.main_image);
                            const idx = allImages.findIndex(
                                (img) => img.src === mainSrc,
                            );
                            return (
                                <Card
                                    key={collage.id}
                                    className="group cursor-pointer overflow-hidden border-brand/10 transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/10"
                                    onClick={() =>
                                        idx >= 0 && openLightbox(idx)
                                    }
                                >
                                    <div className="relative h-52 overflow-hidden">
                                        <img
                                            src={mainSrc || undefined}
                                            alt={collage.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                            <h3 className="font-semibold text-white drop-shadow-sm">
                                                {collage.title}
                                            </h3>
                                            <Badge className="bg-white/20 text-white backdrop-blur-sm">
                                                {collage.photo_count ??
                                                    collage.photos?.length ??
                                                    0}{' '}
                                                фото
                                            </Badge>
                                        </div>
                                        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                            <Maximize2 className="h-3.5 w-3.5 text-white" />
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </Stagger>
                </Reveal>
            )}

            {/* ─── Photos Grid ─── */}
            {items.length > 0 && (
                <Reveal className="mt-8">
                    <p className="dw-kicker mb-4">Фотографии</p>
                    <Stagger className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
                        {items.map((item, i) => {
                            const src = mediaUrl(item.filename);
                            return (
                                <div
                                    key={item.id}
                                    className="group cursor-pointer overflow-hidden rounded-xl border border-brand/10 transition-all duration-300 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/10"
                                    onClick={() => openLightbox(i)}
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={src || undefined}
                                            alt={
                                                item.alt_text ||
                                                item.title ||
                                                `photo-${item.id}`
                                            }
                                            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                                        <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                            <Maximize2 className="h-3.5 w-3.5 text-white" />
                                        </div>
                                        {item.title && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                                                <p className="text-xs font-medium text-white">
                                                    {item.title}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </Stagger>
                </Reveal>
            )}

            {items.length === 0 && collages.length === 0 && (
                <Card className="mt-8">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Фотографии скоро появятся
                    </CardContent>
                </Card>
            )}

            {/* ─── Lightbox Dialog ─── */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="flex h-[90vh] max-w-[95vw] flex-col overflow-hidden border-0 bg-black/95 p-0 shadow-2xl sm:rounded-2xl">
                    {/* Top controls */}
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-white/80">
                                {currentIndex + 1} / {allImages.length}
                            </p>
                            {current?.title && (
                                <span className="hidden text-xs text-white/50 sm:inline">
                                    — {current.title}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/80 hover:bg-white/10 hover:text-white"
                                onClick={() =>
                                    setScale((s) => Math.min(s + 0.25, 4))
                                }
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/80 hover:bg-white/10 hover:text-white"
                                onClick={() =>
                                    setScale((s) => Math.max(s - 0.25, 0.5))
                                }
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/80 hover:bg-white/10 hover:text-white"
                                onClick={resetView}
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                            <span className="mx-1 text-xs text-white/50">
                                {Math.round(scale * 100)}%
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/80 hover:bg-white/10 hover:text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Image area */}
                    <div
                        className="relative flex flex-1 items-center justify-center overflow-hidden"
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        style={{
                            cursor:
                                scale > 1
                                    ? isDragging
                                        ? 'grabbing'
                                        : 'grab'
                                    : 'default',
                        }}
                    >
                        {current && (
                            <img
                                src={current.src}
                                alt={current.title}
                                draggable={false}
                                className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
                                style={{
                                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                                }}
                            />
                        )}

                        {/* Nav arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                                    onClick={() => navigate(-1)}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
                                    onClick={() => navigate(1)}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {allImages.length > 1 && (
                        <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 pt-1">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === currentIndex
                                            ? 'border-brand opacity-100'
                                            : 'border-transparent opacity-50 hover:opacity-80'
                                        }`}
                                    onClick={() => {
                                        setCurrentIndex(i);
                                        resetView();
                                    }}
                                >
                                    <img
                                        src={img.src}
                                        alt={img.title}
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </SiteLayout>
    );
}
