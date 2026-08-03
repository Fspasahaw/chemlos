import { createElement, ReactNode } from 'react';

interface Tab {
    key: string;
    label: string;
    icon?: ReactNode | React.ComponentType<{ className?: string }>;
}

interface TabsProps {
    tabs: Tab[];
    active: string;
    onChange: (key: string) => void;
    className?: string;
}

function renderTabIcon(icon: Tab['icon']) {
    if (!icon) return null;
    if (typeof icon === 'function' || (typeof icon === 'object' && '$$typeof' in (icon as object))) {
        return createElement(icon as React.ComponentType<{ className?: string }>, { className: 'h-4 w-4' });
    }
    return <span className="h-4 w-4">{icon}</span>;
}

export function Tabs({ tabs, active, onChange, className = '' }: TabsProps) {
    return (
        <div className={`mb-4 flex gap-2 overflow-x-auto border-b border-slate-200/80 dark:border-slate-800/80 ${className}`}>
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChange(tab.key)}
                    className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition ${
                        active === tab.key
                            ? 'border-b-2 border-indigo-600 text-indigo-600'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    {renderTabIcon(tab.icon)}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

interface TabPanelProps {
    active: string;
    tabKey: string;
    children: ReactNode;
}

export function TabPanel({ active, tabKey, children }: TabPanelProps) {
    if (active !== tabKey) return null;
    return <div className="animate-fadeIn">{children}</div>;
}
