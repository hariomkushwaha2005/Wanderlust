const baseUrl = "https://wanderlust.invalid";

const sanitizeRedirect = (value, fallback = "/listings") => {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    if (!trimmed.startsWith("/")) return fallback;

    try {
        const redirectUrl = new URL(trimmed, baseUrl);
        if (redirectUrl.origin !== baseUrl) return fallback;
        return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
    } catch {
        return fallback;
    }
};

export default sanitizeRedirect;