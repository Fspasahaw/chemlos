import { useEffect, useRef, useState } from 'react';

interface RecaptchaHook {
    getToken: (action: string) => Promise<string | null>;
    ready: boolean;
}

export function useRecaptcha(siteKey?: string): RecaptchaHook {
    const [ready, setReady] = useState(false);
    const loadAttempted = useRef(false);

    useEffect(() => {
        if (!siteKey || loadAttempted.current) return;
        loadAttempted.current = true;

        if (document.querySelector(`script[data-recaptcha="${siteKey}"]`)) {
            setReady(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;
        script.dataset.recaptcha = siteKey;
        script.onload = () => setReady(true);
        script.onerror = () => setReady(false);
        document.body.appendChild(script);
    }, [siteKey]);

    const getToken = async (action: string): Promise<string | null> => {
        const grecaptcha = window.grecaptcha;

        if (!siteKey || !grecaptcha || !ready) {
            return null;
        }

        return new Promise((resolve) => {
            grecaptcha.ready(() => {
                grecaptcha
                    .execute(siteKey, { action })
                    .then((token: string) => resolve(token))
                    .catch(() => resolve(null));
            });
        });
    };

    return { getToken, ready };
}

declare global {
    interface Window {
        grecaptcha?: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}
