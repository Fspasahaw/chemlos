import { useState } from 'react';

interface AvatarProps {
    src?: string | null;
    name?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
};

const gradients = [
    'from-indigo-500 to-violet-500 text-white',
    'from-sky-500 to-cyan-500 text-white',
    'from-emerald-500 to-teal-500 text-white',
    'from-rose-500 to-pink-500 text-white',
    'from-amber-500 to-orange-500 text-white',
    'from-fuchsia-500 to-purple-500 text-white',
    'from-lime-500 to-green-500 text-white',
    'from-blue-500 to-indigo-500 text-white',
];

function getGradientForName(name: string): string {
    if (!name.trim()) return gradients[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
}

export function Avatar({ src, name = '', alt, size = 'md', className = '' }: AvatarProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const imageUrl = src && !src.startsWith('http') && !src.startsWith('/')
        ? `/storage/${src}`
        : src;

    const gradient = getGradientForName(name);
    const [error, setError] = useState(false);

    return (
        <div className={`flex items-center justify-center rounded-full overflow-hidden bg-linear-to-br ${gradient} ${sizeClasses[size]} ${className}`}>
            {imageUrl && !error ? (
                <img src={imageUrl} alt={alt ?? name} className="h-full w-full object-cover" onError={() => setError(true)} />
            ) : (
                <span className="font-semibold">{initials || '?'}</span>
            )}
        </div>
    );
}
