import ChartJS from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import { useTheme } from '../Providers/ThemeProvider';

type ChartType = 'line' | 'bar' | 'doughnut' | 'pie' | 'horizontalBar';

interface ChartProps {
    type: ChartType;
    data: any;
    options?: any;
    height?: number;
    className?: string;
}

export function Chart({ type, data, options = {}, height = 260, className = '' }: ChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS | null>(null);
    const { resolvedTheme } = useTheme();

    const isDark = resolvedTheme === 'dark';

    useEffect(() => {
        if (!canvasRef.current) return;

        const gridColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.15)';
        const tickColor = isDark ? '#94a3b8' : '#475569';

        const baseOptions: any = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: tickColor, font: { family: 'Inter', size: 12 } },
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#f1f5f9' : '#0f172a',
                    bodyColor: isDark ? '#cbd5e1' : '#334155',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderWidth: 1,
                    cornerRadius: 12,
                    padding: 12,
                    titleFont: { family: 'Poppins', size: 13, weight: '600' },
                    bodyFont: { family: 'Inter', size: 12 },
                },
            },
        };

        if (type === 'line' || type === 'bar' || type === 'horizontalBar') {
            baseOptions.scales = {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: tickColor, font: { family: 'Inter', size: 11 } },
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { color: tickColor, font: { family: 'Inter', size: 11 } },
                },
            };

            if (type === 'horizontalBar') {
                baseOptions.indexAxis = 'y';
            }
        }

        const chart = new ChartJS(canvasRef.current, {
            type: type === 'horizontalBar' ? 'bar' : type,
            data,
            options: { ...baseOptions, ...options },
        });

        chartRef.current = chart;

        return () => {
            chart.destroy();
            chartRef.current = null;
        };
    }, [data, options, isDark, type]);

    return <canvas ref={canvasRef} className={`w-full ${className}`} style={{ height }} />;
}
