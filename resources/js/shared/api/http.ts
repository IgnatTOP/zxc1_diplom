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

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const key = `${encodeURIComponent(name)}=`;
    const part = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(key));

    if (!part) {
        return null;
    }

    return decodeURIComponent(part.slice(key.length));
}

async function requestWithBody<T>(
    method: 'POST' | 'PATCH' | 'DELETE',
    url: string,
    data: unknown,
    init?: RequestInit,
): Promise<T> {
    const csrfMeta = document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content');
    const xsrfCookie = readCookie('XSRF-TOKEN');
    const csrfToken = xsrfCookie || csrfMeta;

    const isFormData = data instanceof FormData;
    let finalMethod = method;
    let finalData: BodyInit | null = null;

    if (isFormData) {
        if (method === 'PATCH') {
            data.append('_method', 'PATCH');
            finalMethod = 'POST';
        }
        finalData = data as unknown as BodyInit;
    } else {
        finalData = JSON.stringify(data);
    }

    const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        ...(xsrfCookie ? { 'X-XSRF-TOKEN': xsrfCookie } : {}),
        ...(init?.headers as Record<string, string> || {}),
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        method: finalMethod,
        credentials: 'same-origin',
        ...init,
        headers,
        body: finalData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${method} ${url} failed: ${response.status} ${text}`);
    }

    return (await response.json()) as T;
}
