// Central place to configure your backend URL.
// Change this to point to your deployed backend.
export const BACKEND_URL = "http://localhost:8000";

// Optionally, you can override via a global (useful during local testing):
export const EFFECTIVE_BACKEND_URL: string = (typeof window !== "undefined" && (window as any).BACKEND_URL) || BACKEND_URL;
