export async function apiGet<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        credentials: 'same-origin',
        ...init,
        headers: {
            Accept: 'application/json',
            ...(init?.headers || {}),
        },
    });

    if (!response.ok) {
        throw new Error(`GET ${url} failed with ${response.status}`);
    }

    return (await response.json()) as T;
}

export async function apiPost<T>(
    url: string,
    data: unknown,
    init?: RequestInit,
): Promise<T> {
    return requestWithBody<T>('POST', url, data, init);
}

export async function apiPatch<T>(
    url: string,
    data: unknown,
    init?: RequestInit,
): Promise<T> {
    return requestWithBody<T>('PATCH', url, data, init);
}

export async function apiDelete<T>(
    url: string,
    data?: unknown,
    init?: RequestInit,
): Promise<T> {
    return requestWithBody<T>('DELETE', url, data ?? {}, init);
}

async function requestWithBody<T>(
    method: 'POST' | 'PATCH' | 'DELETE',
    url: string,
    data: unknown,
    init?: RequestInit,
): Promise<T> {
    const csrf = document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content');

    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        ...init,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
            ...(init?.headers || {}),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${method} ${url} failed: ${response.status} ${text}`);
    }

    return (await response.json()) as T;
}
