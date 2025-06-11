// utils/crypto.js
export async function generateAESKey() {
    return await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptWithAESKey(aesKey, data) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        data
    );
    return { encrypted, iv };
}

export async function encryptAESKeyWithRSA(aesKey, rsaPublicKey) {
    const rawKey = await window.crypto.subtle.exportKey("raw", aesKey);
    return await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        rsaPublicKey,
        rawKey
    );
}

/**
 * Import RSA public key (PEM format) to CryptoKey
 * @param {string} pem - PEM string (-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----)
 * @returns {Promise<CryptoKey>}
 */
export async function importRSAPublicKey(pem) {
    // Remove header, footer, and line breaks
    const b64 = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, "")
        .replace(/-----END PUBLIC KEY-----/, "")
        .replace(/\s+/g, "");
    const binaryDer = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer.buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}