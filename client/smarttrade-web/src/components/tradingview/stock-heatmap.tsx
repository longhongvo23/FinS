import { useEffect, useRef, memo } from 'react';
import { useUIStore } from '@/stores/ui-store';

// Inner widget component that follows TradingView's exact pattern
const StockHeatmapWidget = memo(({ colorTheme }: { colorTheme: 'dark' | 'light' }) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const containerEl = container.current;
        if (!containerEl) return;

        // Use requestAnimationFrame to ensure DOM is fully painted before adding script
        const frameId = requestAnimationFrame(() => {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
            script.type = 'text/javascript';
            script.async = true;
            script.innerHTML = `
            {
              "exchanges": [],
              "dataSource": "SPX500",
              "grouping": "sector",
              "blockSize": "market_cap_basic",
              "blockColor": "change",
              "locale": "vi_VN",
              "symbolUrl": "",
              "colorTheme": "${colorTheme}",
              "hasTopBar": true,
              "isDataSetEnabled": true,
              "isZoomEnabled": true,
              "hasSymbolTooltip": true,
              "width": "100%",
              "height": "100%"
            }`;
            containerEl.appendChild(script);
        });

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [colorTheme]);

    return (
        <div className="tradingview-widget-container h-full w-full" ref={container}>
            <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
            <div className="tradingview-widget-copyright">
                <a href="https://vn.tradingview.com/" rel="noopener noreferrer" target="_blank">
                    <span className="blue-text">Bản đồ nhiệt Chứng khoán</span>
                </a>
            </div>
        </div>
    );
});

StockHeatmapWidget.displayName = 'StockHeatmapWidget';

// Wrapper component that handles theme changes by remounting the widget
const StockHeatmap = () => {
    const { theme } = useUIStore();
    const colorTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';

    return (
        <StockHeatmapWidget key={colorTheme} colorTheme={colorTheme} />
    );
};

export default memo(StockHeatmap);

