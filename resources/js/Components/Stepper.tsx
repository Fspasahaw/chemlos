import { Check, X } from 'lucide-react';
import { createElement, ReactNode, useMemo } from 'react';

export interface StepperStep {
    key: string;
    label: string;
    description?: string;
    icon?: ReactNode | React.ComponentType<{ className?: string }>;
}

interface StepperProps {
    steps: StepperStep[];
    activeKey?: string;
    completedKeys?: string[];
    failedKey?: string;
    onChange?: (key: string) => void;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    showDescription?: boolean;
}

function renderIcon(icon: StepperStep['icon'], className = 'h-4 w-4') {
    if (!icon) return null;
    if (typeof icon === 'function' || (typeof icon === 'object' && '$$typeof' in (icon as object))) {
        return createElement(icon as React.ComponentType<{ className?: string }>, { className });
    }
    return <span className={className}>{icon}</span>;
}

export function Stepper({
    steps,
    activeKey,
    completedKeys,
    failedKey,
    onChange,
    orientation = 'horizontal',
    className = '',
    showDescription = true,
}: StepperProps) {
    const activeIndex = useMemo(() => {
        if (!activeKey) return -1;
        return steps.findIndex((s) => s.key === activeKey);
    }, [steps, activeKey]);

    const completedSet = useMemo(() => {
        if (completedKeys) return new Set(completedKeys);
        const set = new Set<string>();
        if (activeIndex > 0) {
            for (let i = 0; i < activeIndex; i++) {
                set.add(steps[i].key);
            }
        }
        return set;
    }, [completedKeys, activeIndex, steps]);

    const isHorizontal = orientation === 'horizontal';

    return (
        <div className={`${isHorizontal ? 'w-full' : 'flex'} ${className}`}>
            <div className={`${isHorizontal ? 'flex' : 'flex-col'} w-full`}>
                {steps.map((step, index) => {
                    const isActive = step.key === activeKey;
                    const isCompleted = completedSet.has(step.key);
                    const isFailed = step.key === failedKey;
                    const isLast = index === steps.length - 1;

                    const baseCircle =
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300';
                    const circleClass = isFailed
                        ? `${baseCircle} border-rose-500 bg-rose-500 text-white`
                        : isActive
                          ? `${baseCircle} border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30`
                          : isCompleted
                            ? `${baseCircle} border-indigo-600 bg-indigo-600 text-white`
                            : `${baseCircle} border-slate-300 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400`;

                    const lineClass = isHorizontal
                        ? `hidden h-0.5 flex-1 -translate-y-5 sm:block ${isCompleted ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`
                        : `absolute left-[1.125rem] top-12 h-[calc(100%-3rem)] w-0.5 ${isCompleted ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`;

                    const content = (
                        <div className={`flex ${isHorizontal ? 'flex-col items-center text-center' : 'items-start gap-4'} relative`}>
                            {!isHorizontal && !isLast && <div className={lineClass} />}
                            <div className={circleClass}>
                                {isFailed ? <X className="h-5 w-5" /> : isCompleted && !isActive ? <Check className="h-5 w-5" /> : renderIcon(step.icon) ?? step.key}
                            </div>
                            <div className={`${isHorizontal ? 'mt-2' : ''}`}>
                                <p
                                    className={`text-sm font-semibold ${
                                        isActive ? 'text-indigo-600 dark:text-indigo-400' : isFailed ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
                                    }`}
                                >
                                    {step.label}
                                </p>
                                {showDescription && step.description && (
                                    <p className="max-w-md text-xs text-slate-500 dark:text-slate-400">{step.description}</p>
                                )}
                            </div>
                        </div>
                    );

                    return (
                        <div key={step.key} className={`flex ${isHorizontal ? 'flex-1 items-start' : 'relative w-full'} ${onChange ? 'cursor-pointer' : ''}`}>
                            {isHorizontal && index > 0 && <div className="hidden h-0.5 w-4 -translate-y-5 sm:block" />}
                            <div
                                className={`flex-1 ${isHorizontal ? '' : 'pb-8'}`}
                                onClick={() => !isFailed && onChange?.(step.key)}
                                role={onChange ? 'button' : undefined}
                                tabIndex={onChange ? 0 : undefined}
                            >
                                {content}
                            </div>
                            {isHorizontal && !isLast && <div className={lineClass} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
