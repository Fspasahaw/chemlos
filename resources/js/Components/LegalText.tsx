interface LegalTextProps {
    content: string;
    className?: string;
}

export function LegalText({ content, className = '' }: LegalTextProps) {
    if (!content) return <p className="text-slate-500">Belum tersedia.</p>;

    const lines = content.split('\n');
    const items: { number: string; title: string; body: string[] }[] = [];
    let current: typeof items[0] | null = null;

    for (const raw of lines) {
        const line = raw.trimEnd();
        if (!line.trim()) continue;

        const match = line.match(/^(\d+)\.\s*(.*)$/);
        if (match) {
            if (current) items.push(current);
            current = { number: match[1], title: match[2].trim(), body: [] };
        } else if (current) {
            current.body.push(line.trim());
        } else {
            // Non-numbered content before first number: render later as plain paragraph
            if (items.length === 0) {
                items.push({ number: '', title: '', body: [line.trim()] });
            } else {
                current = { number: '', title: '', body: [line.trim()] };
            }
        }
    }
    if (current) items.push(current);

    return (
        <div className={`space-y-4 ${className}`}>
            {items.map((item, i) => (
                <div key={i}>
                    {item.title ? (
                        <div className="flex gap-2">
                            <span className="shrink-0 font-semibold text-slate-900 dark:text-slate-100">{item.number}.</span>
                            <div className="space-y-1">
                                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                                {item.body.map((b, idx) => (
                                    <p key={idx} className="text-slate-600 dark:text-slate-300">{b}</p>
                                ))}
                            </div>
                        </div>
                    ) : (
                        item.body.map((b, idx) => (
                            <p key={idx} className="text-slate-600 dark:text-slate-300">{b}</p>
                        ))
                    )}
                </div>
            ))}
        </div>
    );
}
