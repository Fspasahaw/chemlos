import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    delay?: number;
    className?: string;
    autoFlip?: boolean;
}

const OPPOSITE: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
};

const OFFSET = 8;

export function Tooltip({ children, content, position = 'top', delay = 300, className = '', autoFlip = true }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [computed, setComputed] = useState(position === 'auto' ? 'top' : position);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const computePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipEl = tooltipRef.current;
        const tw = tooltipEl?.offsetWidth ?? 200;
        const th = tooltipEl?.offsetHeight ?? 40;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let pos = position === 'auto' ? 'top' : position;

        const positions: Record<string, { x: number; y: number }> = {
            top: { x: rect.left + rect.width / 2 - tw / 2, y: rect.top - th - OFFSET },
            bottom: { x: rect.left + rect.width / 2 - tw / 2, y: rect.bottom + OFFSET },
            left: { x: rect.left - tw - OFFSET, y: rect.top + rect.height / 2 - th / 2 },
            right: { x: rect.right + OFFSET, y: rect.top + rect.height / 2 - th / 2 },
        };

        if (autoFlip) {
            const overflows: Record<string, boolean> = {
                top: positions.top.y < OFFSET,
                bottom: positions.bottom.y + th > vh - OFFSET,
                left: positions.left.x < OFFSET,
                right: positions.right.x + tw > vw - OFFSET,
            };
            if (overflows[pos]) {
                pos = OPPOSITE[pos];
            }
        }

        let { x, y } = positions[pos];
        x = Math.max(OFFSET, Math.min(x, vw - tw - OFFSET));
        y = Math.max(OFFSET, Math.min(y, vh - th - OFFSET));

        setComputed(pos as any);
        setCoords({ x, y });
    };

    useEffect(() => {
        if (visible) computePosition();
    }, [visible]);

    const show = () => {
        timer.current = setTimeout(() => setVisible(true), delay);
    };

    const hide = () => {
        if (timer.current) clearTimeout(timer.current);
        setVisible(false);
    };

    return (
        <div
            ref={triggerRef}
            className={`inline-flex ${className}`}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}
            {visible && createPortal(
                <div
                    ref={tooltipRef}
                    className={`pointer-events-none fixed z-[100] w-max max-w-xs rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg dark:bg-slate-700`}
                    style={{ left: coords.x, top: coords.y }}
                    role="tooltip"
                >
                    {content}
                    <span
                        className={`absolute h-0 w-0 border-4 border-transparent ${arrowClass(computed)}`}
                        aria-hidden="true"
                    />
                </div>,
                document.body
            )}
        </div>
    );
}

function arrowClass(position: string) {
    switch (position) {
        case 'top':
            return 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 dark:border-t-slate-700';
        case 'bottom':
            return 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 dark:border-b-slate-700';
        case 'left':
            return 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 dark:border-l-slate-700';
        case 'right':
            return 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 dark:border-r-slate-700';
        default:
            return '';
    }
}
