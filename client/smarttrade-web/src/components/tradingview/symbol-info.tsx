import { useEffect, useRef, memo } from 'react';
import { useUIStore } from '@/stores/ui-store';

interface SymbolInfoWidgetProps {
    symbol: string;
}

export const SymbolInfoWidget = memo(({ symbol }: SymbolInfoWidgetProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useUIStore();

    useEffect(() => {
        if (!containerRef.current) return;

        // Clean up previous content to avoid duplicates
        containerRef.current.innerHTML = '';

        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbol": symbol,
            "width": "100%",
            "locale": "vi_VN",
            "colorTheme": isDark ? "dark" : "light",
            "isTransparent": true // Matches the dashboard style usually
        });

        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container__widget';
        containerRef.current.appendChild(widgetContainer);

        const copyrightContainer = document.createElement('div');
        copyrightContainer.className = 'tradingview-widget-copyright';
        copyrightContainer.innerHTML = `<a href="https://www.tradingview.com/symbols/${symbol.replace(':', '-')}/" rel="noopener" target="_blank"><span class="blue-text">${symbol} quotes</span></a> by TradingView`;
        containerRef.current.appendChild(copyrightContainer);

        containerRef.current.appendChild(script);

    }, [symbol, theme]);

    return (
        <div className="tradingview-widget-container w-full" ref={containerRef} />
    );
});
