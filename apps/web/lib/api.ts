/**
 * Bulletproof URL Utility: Smartly joins base URL and path,
 * stripping out double slashes and accidental /api duplications.
 */
export function getApiUrl(path: string = ''): string {
  // 1. Get the base URL and remove any trailing slashes
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api').replace(/\/+$/, '');

  // 2. Remove any leading slashes from the path the component passed in
  let cleanPath = path.replace(/^\/+/, '');

  // 3. THE MAGIC FIX: If the component accidentally passed 'api/auth/register', 
  // strip the 'api/' part out so we don't duplicate it.
  if (cleanPath.startsWith('api/')) {
    cleanPath = cleanPath.substring(4); // removes 'api/'
  }

  // 4. Safely join them
  return path ? `${baseUrl}/${cleanPath}` : baseUrl;
}

