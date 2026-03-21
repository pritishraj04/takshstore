export function getSafeImageUrl(url: any): string {
    if (!url) return "/main-website-assets/images/placeholder.webp";
    if (typeof url === 'string' && url.startsWith('[')) {
        try {
            const parsed = JSON.parse(url);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
            }
        } catch (e) {
            return url;
        }
    }
    if (Array.isArray(url) && url.length > 0) {
        return url[0];
    }
    return typeof url === 'string' ? url : "/main-website-assets/images/placeholder.webp";
}
