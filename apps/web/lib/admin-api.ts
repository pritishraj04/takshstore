import Cookies from 'js-cookie';
import { getApiUrl } from './api';

/**
 * A wrapper around native fetch that automatically attaches the
 * admin_session cookie as a Bearer token.
 */
export async function adminApiFetch(endpoint: string, options: RequestInit = {}) {
    // 1. Retrieve the session securely
    const token = Cookies.get('admin_session');

    // 2. Prepare the headers, merging any custom headers passed down
    const headers = new Headers(options.headers || {});

    // Ensure standard content-type if not mutating headers extensively
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // 3. Make the cleanly constructed network request
    const response = await fetch(getApiUrl(endpoint), {
        ...options,
        headers,
    });

    // Optionally handle universal 401s here (redirecting back to login)
    if (response.status === 401 && typeof window !== 'undefined') {
        Cookies.remove('admin_session');
        window.location.href = '/admin/login';
    }

    return response;
}
