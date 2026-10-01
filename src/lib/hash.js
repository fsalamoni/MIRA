// ============================================================================
// MIRA — Utilitários de hash (Web Crypto API)
// ============================================================================

/**
 * Calcula SHA-256 de uma string e retorna em hex.
 * Usa Web Crypto API nativa do navegador — funciona offline.
 */
export async function sha256(text) {
    if (!text) return '';
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const buffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    } catch (e) {
        console.error('SHA-256 error:', e);
        return '';
    }
}

/**
 * SHA-256 de um arquivo (File/Blob).
 */
export async function sha256File(file) {
    if (!file) return '';
    try {
        const buffer = await file.arrayBuffer();
        const hash = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    } catch (e) {
        console.error('SHA-256 file error:', e);
        return '';
    }
}

/**
 * Gera UUID v4.
 */
export function uuidv4() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Hash de evidência combinando campos para criar fingerprint.
 */
export async function evidenceHash({ kind, description, reference, author }) {
    const payload = `${kind}|${description}|${reference || ''}|${author}|${new Date().toISOString()}`;
    return sha256(payload);
}
