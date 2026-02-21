import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
import { mediaUrl } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import {
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon,
    Layers,
    Plus,
    Trash2,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type GalleryItem = {
    id: number;
    filename: string | File | null;
    title?: string | null;
    description?: string | null;
    alt_text?: string | null;
    sort_order?: number;
    is_active?: boolean;
};

type CollageItem = {
    id: number;
    title: string;
    main_image: string | File | null;
    photos?: (string | File)[] | null;
    photo_count?: number;
};

type Props = {
    items: GalleryItem[];
    collages: CollageItem[];
};

function normalizeCollage(item: CollageItem): CollageItem {
    return {
        ...item,
        photos: item.photos || [],
        photo_count: item.photo_count ?? item.photos?.length ?? 0,
    };
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

export default function Gallery({ items = [], collages = [] }: Props) {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(items);
    const [collageItems, setCollageItems] = useState<CollageItem[]>(
        collages.map(normalizeCollage),
    );
    const [savingId, setSavingId] = useState<string | null>(null);
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const [itemForm, setItemForm] = useState<{
        filename: File | null;
        title: string;
        description: string;
        altText: string;
        sortOrder: number;
        isActive: boolean;
    }>({
        filename: null,
        title: '',
        description: '',
        altText: '',
        sortOrder: galleryItems.length + 1,
        isActive: true,
    });
    const [collageForm, setCollageForm] = useState<{
        title: string;
        mainImage: File | null;
        photos: File[];
    }>({
        title: '',
        mainImage: null,
        photos: [],
    });

    const activeGalleryCount = useMemo(
        () => galleryItems.filter((item) => item.is_active !== false).length,
        [galleryItems],
    );

    const createGalleryItem = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);

        try {
            const formData = new FormData();
            if (itemForm.filename instanceof File) {
                formData.append('filename', itemForm.filename);
            }
            formData.append('title', itemForm.title);
            formData.append('description', itemForm.description);
            formData.append('altText', itemForm.altText);
            formData.append('sortOrder', String(itemForm.sortOrder));
            formData.append('isActive', itemForm.isActive ? '1' : '0');

            const payload = await apiPost<{ ok: boolean; item: GalleryItem }>(
                '/api/v1/admin/gallery/items',
                formData,
            );

            setGalleryItems((prev) => [...prev, payload.item]);
            setItemForm({
                filename: null,
                title: '',
                description: '',
                altText: '',
                sortOrder: galleryItems.length + 2,
                isActive: true,
            });
            setNotice({ tone: 'success', text: 'Изображение добавлено.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        }
    };

    const saveGalleryItem = async (item: GalleryItem) => {
        setNotice(null);
        setSavingId(`item-${item.id}`);

        try {
            const formData = new FormData();
            if (item.filename instanceof File) {
                formData.append('filename', item.filename);
            } else if (typeof item.filename === 'string') {
                formData.append('filename', item.filename);
            }
            formData.append('title', item.title || '');
            formData.append('description', item.description || '');
            formData.append('altText', item.alt_text || '');
            formData.append('sortOrder', String(item.sort_order ?? 0));
            formData.append('isActive', (item.is_active ?? true) ? '1' : '0');

            const payload = await apiPatch<{ ok: boolean; item: GalleryItem }>(
                `/api/v1/admin/gallery/items/${item.id}`,
                formData,
            );

            setGalleryItems((prev) =>
                prev.map((row) => (row.id === item.id ? payload.item : row)),
            );
            setNotice({
                tone: 'success',
                text: `Изображение #${item.id} обновлено.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const deleteGalleryItem = async (id: number) => {
        setNotice(null);
        setSavingId(`item-${id}`);

        try {
            await apiDelete<{ ok: boolean }>(
                `/api/v1/admin/gallery/items/${id}`,
            );
            setGalleryItems((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Изображение #${id} удалено.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const createCollage = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);

        try {
            const formData = new FormData();
            formData.append('title', collageForm.title);
            if (collageForm.mainImage instanceof File) {
                formData.append('mainImage', collageForm.mainImage);
            }

            collageForm.photos.forEach((photo, index) => {
                if (photo instanceof File) {
                    formData.append(`photos[${index}]`, photo);
                }
            });
            formData.append('photoCount', String(collageForm.photos.length || 4));

            const payload = await apiPost<{ ok: boolean; item: CollageItem }>(
                '/api/v1/admin/gallery/collages',
                formData,
            );

            setCollageItems((prev) => [
                normalizeCollage(payload.item),
                ...prev,
            ]);
            setCollageForm({
                title: '',
                mainImage: null,
                photos: [],
            });
            setNotice({ tone: 'success', text: 'Коллаж добавлен.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        }
    };

    const saveCollage = async (item: CollageItem) => {
        setNotice(null);
        setSavingId(`collage-${item.id}`);

        try {
            const formData = new FormData();
            formData.append('title', item.title);
            if (item.main_image instanceof File) {
                formData.append('mainImage', item.main_image);
            } else if (typeof item.main_image === 'string') {
                formData.append('mainImage', item.main_image);
            }
            if (item.photos && Array.isArray(item.photos)) {
                item.photos.forEach((photo, index) => {
                    if (photo instanceof File) {
                        formData.append(`photos[${index}]`, photo);
                    } else if (typeof photo === 'string') {
                        formData.append(`photos[${index}]`, photo);
                    }
                });
            }
            formData.append('photoCount', String(item.photo_count ?? item.photos?.length ?? 0));

            const payload = await apiPatch<{ ok: boolean; item: CollageItem }>(
                `/api/v1/admin/gallery/collages/${item.id}`,
                formData,
            );

            setCollageItems((prev) =>
                prev.map((row) =>
                    row.id === item.id ? normalizeCollage(payload.item) : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Коллаж #${item.id} обновлён.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const deleteCollage = async (id: number) => {
        setNotice(null);
        setSavingId(`collage-${id}`);

        try {
            await apiDelete<{ ok: boolean }>(
                `/api/v1/admin/gallery/collages/${id}`,
            );
            setCollageItems((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Коллаж #${id} удалён.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <AdminLayout title="Галерея">
            {notice ? (
                <div
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${notice.tone === 'success'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        }`}
                >
                    {notice.tone === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    {notice.text}
                </div>
            ) : null}

            <Card>
                <CardContent className="flex flex-wrap items-center gap-6 pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <ImageIcon className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Фотографии</p>
                            <p className="text-xs text-muted-foreground">
                                Всего: {galleryItems.length} · Активных: {activeGalleryCount}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/30">
                            <Layers className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Коллажи</p>
                            <p className="text-xs text-muted-foreground">
                                Всего: {collageItems.length}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                                <ImageIcon className="h-5 w-5 text-brand" />
                            </div>
                            <CardTitle>Изображения</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            className="grid gap-4"
                            onSubmit={createGalleryItem}
                        >
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Путь/URL изображения *</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] || null;
                                        setItemForm((prev) => ({
                                            ...prev,
                                            filename: file,
                                        }));
                                    }}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Заголовок</label>
                                <Input
                                    placeholder="Заголовок"
                                    value={itemForm.title}
                                    onChange={(event) =>
                                        setItemForm((prev) => ({
                                            ...prev,
                                            title: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Описание</label>
                                <Textarea
                                    rows={3}
                                    placeholder="Описание"
                                    value={itemForm.description}
                                    onChange={(event) =>
                                        setItemForm((prev) => ({
                                            ...prev,
                                            description: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Alt-текст</label>
                                <Input
                                    placeholder="Alt-текст"
                                    value={itemForm.altText}
                                    onChange={(event) =>
                                        setItemForm((prev) => ({
                                            ...prev,
                                            altText: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Сортировка</label>
                                    <Input
                                        type="number"
                                        value={itemForm.sortOrder}
                                        onChange={(event) =>
                                            setItemForm((prev) => ({
                                                ...prev,
                                                sortOrder: Number(
                                                    event.target.value,
                                                ),
                                            }))
                                        }
                                    />
                                </div>
                                <label className="inline-flex h-11 items-center gap-2 self-end rounded-xl border border-border px-3 text-sm">
                                    <input
                                        type="checkbox"
                                        className="accent-brand"
                                        checked={itemForm.isActive}
                                        onChange={(event) =>
                                            setItemForm((prev) => ({
                                                ...prev,
                                                isActive: event.target.checked,
                                            }))
                                        }
                                    />
                                    Активно
                                </label>
                            </div>
                            <Button type="submit">
                                <Plus className="mr-1 h-4 w-4" />
                                Добавить изображение
                            </Button>
                        </form>

                        <div className="space-y-3">
                            {galleryItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="space-y-2 rounded-xl border border-border p-3 transition-shadow hover:shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold">
                                            Фото #{item.id}
                                        </p>
                                        <Badge
                                            variant={
                                                item.is_active === false
                                                    ? 'muted'
                                                    : 'success'
                                            }
                                        >
                                            {item.is_active === false
                                                ? 'Скрыто'
                                                : 'Активно'}
                                        </Badge>
                                    </div>
                                    <img
                                        src={
                                            item.filename instanceof File
                                                ? URL.createObjectURL(item.filename)
                                                : mediaUrl(item.filename) || undefined
                                        }
                                        alt={item.title || `photo-${item.id}`}
                                        className="h-40 w-full rounded-lg object-cover"
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Изображение *</label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0] || null;
                                                if (file) {
                                                    setGalleryItems((prev) =>
                                                        prev.map((row) =>
                                                            row.id === item.id
                                                                ? {
                                                                    ...row,
                                                                    filename: file,
                                                                }
                                                                : row,
                                                        ),
                                                    );
                                                }
                                            }}
                                        />
                                        {typeof item.filename === 'string' && item.filename && (
                                            <p className="text-xs text-muted-foreground truncate">Текущее: {item.filename}</p>
                                        )}
                                        {item.filename instanceof File && (
                                            <p className="text-xs text-muted-foreground truncate">Новое: {item.filename.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Заголовок</label>
                                        <Input
                                            value={item.title || ''}
                                            placeholder="Заголовок"
                                            onChange={(event) =>
                                                setGalleryItems((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                title: event
                                                                    .target.value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Описание</label>
                                        <Textarea
                                            rows={3}
                                            value={item.description || ''}
                                            placeholder="Описание"
                                            onChange={(event) =>
                                                setGalleryItems((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                description:
                                                                    event.target
                                                                        .value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Alt-текст</label>
                                        <Input
                                            value={item.alt_text || ''}
                                            placeholder="Alt-текст"
                                            onChange={(event) =>
                                                setGalleryItems((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                alt_text:
                                                                    event.target
                                                                        .value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground">Сортировка</label>
                                            <Input
                                                type="number"
                                                value={item.sort_order ?? 0}
                                                onChange={(event) =>
                                                    setGalleryItems((prev) =>
                                                        prev.map((row) =>
                                                            row.id === item.id
                                                                ? {
                                                                    ...row,
                                                                    sort_order:
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <label className="inline-flex h-11 items-center gap-2 self-end rounded-xl border border-border px-3 text-sm">
                                            <input
                                                type="checkbox"
                                                className="accent-brand"
                                                checked={
                                                    item.is_active !== false
                                                }
                                                onChange={(event) =>
                                                    setGalleryItems((prev) =>
                                                        prev.map((row) =>
                                                            row.id === item.id
                                                                ? {
                                                                    ...row,
                                                                    is_active:
                                                                        event
                                                                            .target
                                                                            .checked,
                                                                }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                            Активно
                                        </label>
                                    </div>
                                    <div className="flex gap-2 border-t border-border/50 pt-3">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={
                                                savingId === `item-${item.id}`
                                            }
                                            onClick={() =>
                                                saveGalleryItem(item)
                                            }
                                        >
                                            Сохранить
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            disabled={
                                                savingId === `item-${item.id}`
                                            }
                                            onClick={() =>
                                                deleteGalleryItem(item.id)
                                            }
                                        >
                                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                                            Удалить
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/30">
                                <Layers className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <CardTitle>Коллажи</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form className="grid gap-4" onSubmit={createCollage}>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Название коллажа *</label>
                                <Input
                                    placeholder="Название коллажа"
                                    value={collageForm.title}
                                    onChange={(event) =>
                                        setCollageForm((prev) => ({
                                            ...prev,
                                            title: event.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Главное изображение *</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] || null;
                                        setCollageForm((prev) => ({
                                            ...prev,
                                            mainImage: file,
                                        }));
                                    }}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Доп. фото</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(event) => {
                                        const files = Array.from(event.target.files || []);
                                        setCollageForm((prev) => ({
                                            ...prev,
                                            photos: files,
                                        }));
                                    }}
                                />
                                {collageForm.photos.length > 0 && (
                                    <p className="text-xs text-muted-foreground truncate">
                                        Выбрано файлов: {collageForm.photos.length}
                                    </p>
                                )}
                            </div>
                            <Button type="submit">
                                <Plus className="mr-1 h-4 w-4" />
                                Добавить коллаж
                            </Button>
                        </form>

                        <div className="space-y-3">
                            {collageItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="space-y-2 rounded-xl border border-border p-3 transition-shadow hover:shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold">
                                            Коллаж #{item.id}
                                        </p>
                                        <Badge variant="muted">
                                            Фото: {item.photos?.length || 0}
                                        </Badge>
                                    </div>
                                    <img
                                        src={
                                            item.main_image instanceof File
                                                ? URL.createObjectURL(item.main_image)
                                                : mediaUrl(item.main_image) || undefined
                                        }
                                        alt={item.title}
                                        className="h-40 w-full rounded-lg object-cover"
                                    />
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Название</label>
                                        <Input
                                            value={item.title}
                                            onChange={(event) =>
                                                setCollageItems((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                title: event
                                                                    .target.value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Главное фото *</label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0] || null;
                                                if (file) {
                                                    setCollageItems((prev) =>
                                                        prev.map((row) =>
                                                            row.id === item.id
                                                                ? {
                                                                    ...row,
                                                                    main_image: file,
                                                                }
                                                                : row,
                                                        ),
                                                    );
                                                }
                                            }}
                                        />
                                        {typeof item.main_image === 'string' && item.main_image && (
                                            <p className="text-xs text-muted-foreground truncate">Текущее: {item.main_image}</p>
                                        )}
                                        {item.main_image instanceof File && (
                                            <p className="text-xs text-muted-foreground truncate">Новое: {item.main_image.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Доп. фото</label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(event) => {
                                                const files = Array.from(event.target.files || []);
                                                setCollageItems((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                photos: files,
                                                            }
                                                            : row,
                                                    ),
                                                );
                                            }}
                                        />
                                        {item.photos && item.photos.length > 0 && typeof item.photos[0] === 'string' && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                Текущих фото: {item.photos.length}
                                            </p>
                                        )}
                                        {item.photos && item.photos.length > 0 && item.photos[0] instanceof File && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                Новых файлов: {item.photos.length}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Кол-во фото</label>
                                        <Input
                                            type="number"
                                            value={item.photo_count ?? 0}
                                            onChange={(event) =>
                                                setCollageItems((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                photo_count:
                                                                    Number(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    ),
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-2 border-t border-border/50 pt-3">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={
                                                savingId ===
                                                `collage-${item.id}`
                                            }
                                            onClick={() => saveCollage(item)}
                                        >
                                            Сохранить
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            disabled={
                                                savingId ===
                                                `collage-${item.id}`
                                            }
                                            onClick={() =>
                                                deleteCollage(item.id)
                                            }
                                        >
                                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                                            Удалить
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
