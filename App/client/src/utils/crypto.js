export async function encryptData(data, sessionKey) {
    const key = await window.crypto.subtle.importKey(
        "raw", sessionKey, "AES-GCM", false, ["encrypt"]
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(JSON.stringify(data))
    );
    return { encrypted: Array.from(new Uint8Array(encrypted)), iv: Array.from(iv) };
}