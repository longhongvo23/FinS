import { useEffect, useRef, memo } from 'react';
import { useUIStore } from '@/stores/ui-store';

declare global {
    interface Window {
        TradingView: any;
    }
}

interface AdvancedChartProps {
    symbol?: string;
    height?: number;
}

const AdvancedChart = ({ symbol = 'NASDAQ:AAPL', height = 600 }: AdvancedChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useUIStore();
    const containerId = `tradingview_chart_${symbol.replace(':', '_').toLowerCase()}`;

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous widget
        containerRef.current.innerHTML = '';

        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
            if (typeof window.TradingView !== 'undefined' && containerRef.current) {
                new window.TradingView.widget({
                    autosize: true,
                    symbol: symbol,
                    interval: 'D',
                    timezone: 'Asia/Ho_Chi_Minh',
                    theme: isDark ? 'dark' : 'light',
                    style: '1',
                    locale: 'vi_VN',
                    toolbar_bg: isDark ? '#1e1e1e' : '#f1f3f6',
                    enable_publishing: false,
                    allow_symbol_change: true,
                    container_id: containerId,
                    details: true,
                    hotlist: true,
                    calendar: true,
                    withdateranges: true,
                    hide_side_toolbar: false,
                });
            }
        };

        containerRef.current.appendChild(script);
    }, [theme, symbol, containerId]);

    return (
        <div className='tradingview-widget-container' style={{ height: `${height}px`, width: '100%' }}>
            <div id={containerId} ref={containerRef} style={{ height: 'calc(100% - 32px)', width: '100%' }} />
            <div className="tradingview-widget-copyright">
                <a href="https://vn.tradingview.com/" rel="noopener noreferrer" target="_blank">
                    <span className="blue-text">Theo dõi biểu đồ trên TradingView</span>
                </a>
            </div>
        </div>
    );
};

export default memo(AdvancedChart);

