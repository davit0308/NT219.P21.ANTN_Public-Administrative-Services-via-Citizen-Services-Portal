export async function loadOQS() {
    if (window.OQS) return window.OQS;

    return new Promise((resolve, reject) => {
        // Nếu đã có script thì không load lại
        if (document.querySelector('script[src="/liboqs.js"]')) {
            // Đợi cho đến khi window.OQS có
            const check = () => {
                if (window.OQS) return resolve(window.OQS);
                setTimeout(check, 50);
            };
            check();
            return;
        }

        const script = document.createElement('script');
        script.src = '/liboqs.js';
        script.onload = () => {
            // Đợi cho đến khi window.OQS được gán (do liboqsModule().then)
            const check = () => {
                if (window.OQS) return resolve(window.OQS);
                setTimeout(check, 50);
            };
            check();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
}