import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    resolvedTheme: 'dark',
    setTheme: () => {},
});

export function useTheme() {
    return useContext(ThemeContext);
}

function isValidTheme(value: string | null | undefined): value is Theme {
    return value === 'light' || value === 'dark' || value === 'system';
}

function getUserPreference(key: 'tema_preferensi' | 'bahasa_preferensi'): string | null {
    if (typeof window === 'undefined') return null;
    const script = document.querySelector('script[data-page="app"]');
    if (!script) return null;
    try {
        const page = JSON.parse(script.textContent || '');
        return page.props?.auth?.user?.[key] ?? null;
    } catch {
        return null;
    }
}

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem('theme') as Theme | null;
    if (isValidTheme(stored)) return stored;
    const userTheme = getUserPreference('tema_preferensi');
    return isValidTheme(userTheme) ? userTheme : 'system';
}

function resolve(theme: Theme): 'light' | 'dark' {
    if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolve(getInitialTheme()));

    const setTheme = (value: Theme) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', value);
        }
        setThemeState(value);
    };

    useEffect(() => {
        const root = document.documentElement;
        const resolved = resolve(theme);
        setResolvedTheme(resolved);
        if (resolved === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        const listener = (e: MediaQueryListEvent) => {
            if (theme === 'system') {
                setResolvedTheme(e.matches ? 'dark' : 'light');
                const root = document.documentElement;
                if (e.matches) root.classList.add('dark');
                else root.classList.remove('dark');
            }
        };
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
