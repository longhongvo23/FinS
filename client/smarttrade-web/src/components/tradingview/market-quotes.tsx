import { useEffect, useRef, memo } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { Card } from '@/components/ui/card';

export const MarketQuotes = memo(() => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useUIStore();

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "width": "100%",
            "height": 550,
            "symbolsGroups": [
                {
                    "name": "Danh mục theo dõi",
                    "originalName": "Indices",
                    "symbols": [
                        { "name": "NASDAQ:AAPL", "displayName": "Apple Inc" },
                        { "name": "NASDAQ:NVDA", "displayName": "NVIDIA Corp" },
                        { "name": "NASDAQ:MSFT", "displayName": "Microsoft Corp" },
                        { "name": "NASDAQ:AMZN", "displayName": "Amazon.com Inc" },
                        { "name": "NASDAQ:TSLA", "displayName": "Tesla Inc" },
                        { "name": "NASDAQ:META", "displayName": "Meta Platforms" },
                        { "name": "NASDAQ:GOOGL", "displayName": "Alphabet Inc" }
                    ]
                }
            ],
            "showSymbolLogo": true,
            "isTransparent": true,
            "colorTheme": isDark ? "dark" : "light",
            "locale": "vi"
        });

        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container__widget';
        container.appendChild(widgetContainer);

        const copyrightContainer = document.createElement('div');
        copyrightContainer.className = 'tradingview-widget-copyright';
        copyrightContainer.innerHTML = `<a href="https://vn.tradingview.com/" rel="noopener" target="_blank"><span class="blue-text">Báo giá thị trường</span></a> bởi TradingView`;
        container.appendChild(copyrightContainer);

        container.appendChild(script);

        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };

    }, [isDark]);

    return (
        <Card className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-sm">
            <div
                key={isDark ? 'dark' : 'light'}
                className="tradingview-widget-container"
                ref={containerRef}
            />
        </Card>
    );
});
