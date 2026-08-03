import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Lang = 'id' | 'en';

interface LangContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (idText: string, enText: string) => string;
}

const LangContext = createContext<LangContextType>({
    lang: 'id',
    setLang: () => {},
    t: (a: string) => a,
});

export function useLang() {
    return useContext(LangContext);
}

function isValidLang(value: string | null | undefined): value is Lang {
    return value === 'id' || value === 'en';
}

function getUserLang(): Lang | null {
    if (typeof window === 'undefined') return null;
    const script = document.querySelector('script[data-page="app"]');
    if (!script) return null;
    try {
        const page = JSON.parse(script.textContent || '');
        const value = page.props?.auth?.user?.bahasa_preferensi;
        return isValidLang(value) ? value : null;
    } catch {
        return null;
    }
}

function getInitialLang(): Lang {
    if (typeof window === 'undefined') return 'id';
    const stored = localStorage.getItem('lang') as Lang | null;
    if (isValidLang(stored)) return stored;
    return getUserLang() ?? 'id';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>(getInitialLang);

    const setLang = (value: Lang) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('lang', value);
        }
        setLangState(value);
    };

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    const t = (idText: string, enText: string) => (lang === 'id' ? idText : enText);

    return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}
