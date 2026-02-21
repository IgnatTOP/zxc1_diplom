import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const csrfToken = document
    .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
    ?.getAttribute('content');
const xsrfCookie = (() => {
    const key = 'XSRF-TOKEN=';
    const part = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(key));

    return part ? decodeURIComponent(part.slice(key.length)) : null;
})();

const isReverbEnabled =
    import.meta.env.VITE_REVERB_ENABLED !== 'false' &&
    import.meta.env.VITE_REVERB_APP_KEY &&
    import.meta.env.VITE_REVERB_HOST &&
    import.meta.env.VITE_REVERB_PORT;

if (isReverbEnabled) {
    window.Pusher = Pusher;

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: Number(import.meta.env.VITE_REVERB_PORT),
        wssPort: Number(import.meta.env.VITE_REVERB_PORT),
        forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: {
                ...(xsrfCookie ? { 'X-XSRF-TOKEN': xsrfCookie } : {}),
                ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
            },
        },
    });
}
