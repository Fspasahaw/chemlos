import { Check, Circle } from 'lucide-react';

interface PasswordIndicatorProps {
    password: string;
}

export default function PasswordIndicator({ password }: PasswordIndicatorProps) {
    const rules = [
        { label: 'Minimal 8 karakter', test: password.length >= 8 },
        { label: 'Huruf besar (A-Z)', test: /[A-Z]/.test(password) },
        { label: 'Huruf kecil (a-z)', test: /[a-z]/.test(password) },
        { label: 'Angka (0-9)', test: /\d/.test(password) },
        { label: 'Simbol (!@#$%^&*)', test: /[!@#$%^&*()_+\-=\[\]{};'\\:"|,.<>/?]/.test(password) },
    ];

    const passed = rules.filter((r) => r.test).length;
    const strength = passed <= 2 ? 'Lemah' : passed <= 4 ? 'Sedang' : 'Kuat';
    const color = passed <= 2 ? 'bg-red-500' : passed <= 4 ? 'bg-yellow-500' : 'bg-green-500';
    const width = `${(passed / rules.length) * 100}%`;

    return (
        <div className="mt-2 space-y-2">
            <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-700">
                <div className={`h-2 rounded ${color} transition-all duration-300`} style={{ width }} />
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Kekuatan: {strength}</p>
            <ul className="space-y-1">
                {rules.map((r) => (
                    <li
                        key={r.label}
                        className={`flex items-center gap-2 text-xs ${r.test ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}
                    >
                        {r.test ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        {r.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
