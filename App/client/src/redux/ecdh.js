export async function ecdhHandshake() {
    // 1. Lấy public key server
    const res = await fetch('/api/ecdh-params');
    const { server_public_key } = await res.json();

    // 2. Tạo keypair ECDH phía client
    const clientKeyPair = await window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256",
        },
        true,
        ["deriveKey", "deriveBits"]
    );

    // 3. Import server public key (PEM -> ArrayBuffer)
    function pemToArrayBuffer(pem) {
        const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
        const binary = atob(b64);
        const buf = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
        return buf.buffer;
    }
    const serverKeyBuffer = pemToArrayBuffer(server_public_key);
    const serverPubKey = await window.crypto.subtle.importKey(
        "spki",
        serverKeyBuffer,
        { name: "ECDH", namedCurve: "P-256" },
        true,
        []
    );

    // 4. Export client public key (SPKI PEM)
    const clientPubKeyBuffer = await window.crypto.subtle.exportKey("spki", clientKeyPair.publicKey);
    function arrayBufferToPem(buffer) {
        const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        const lines = b64.match(/.{1,64}/g).join('\n');
        return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----\n`;
    }
    const clientPubKeyPem = arrayBufferToPem(clientPubKeyBuffer);

    // 5. Gửi client public key cho server
    await fetch('/api/ecdh-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_public_key: clientPubKeyPem })
    });

    // 6. Tính shared key phía client
    const sharedSecret = await window.crypto.subtle.deriveBits(
        {
            name: "ECDH",
            public: serverPubKey,
        },
        clientKeyPair.privateKey,
        256
    );
    // sharedSecret là ArrayBuffer, có thể dùng để tạo key AES
    return sharedSecret;
}