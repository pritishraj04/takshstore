/**
 * Securely retrieves the base API URL from the environment.
 * Throws an error if NEXT_PUBLIC_API_URL is missing to prevent silent fallback bugs.
 */
export const getApiUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined in the environment.");
    }
    // Ensure no trailing slash
    return url.replace(/\/$/, "");
};
