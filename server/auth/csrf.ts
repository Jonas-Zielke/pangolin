import * as crypto from "crypto";
export const CSRF_COOKIE_NAME = "p_csrf_token";

const store = new Map<string, string>();

export function generateCsrfToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

export function setCsrfToken(sessionToken: string, csrfToken: string): void {
    store.set(sessionToken, csrfToken);
}

export function getCsrfToken(sessionToken: string): string | undefined {
    return store.get(sessionToken);
}

export function deleteCsrfToken(sessionToken: string): void {
    store.delete(sessionToken);
}
