import { useEffect, useRef, memo } from 'react';
import { useUIStore } from '@/stores/ui-store';

interface SymbolNewsWidgetProps {
    symbol: string;
}

// Inner widget component
const SymbolNewsWidgetInner = memo(({ symbol, colorTheme }: { symbol: string; colorTheme: 'dark' | 'light' }) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
        script.type = "text/javascript";
        script.async = true;
        // feedMode: "symbol" shows news specific to the symbol
        script.innerHTML = `
        {
          "feedMode": "symbol",
          "symbol": "${symbol}",
          "isTransparent": true,
          "displayMode": "regular",
          "width": "100%",
          "height": "100%",
          "colorTheme": "${colorTheme}",
          "locale": "vi_VN"
        }`;
        container.current.appendChild(script);
    }, [symbol, colorTheme]);

    return (
        <div className="tradingview-widget-container h-full w-full" ref={container}>
            <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
        </div>
    );
});

SymbolNewsWidgetInner.displayName = 'SymbolNewsWidgetInner';

// Wrapper component that handles theme changes
export const SymbolNewsWidget = memo(({ symbol }: SymbolNewsWidgetProps) => {
    const { theme } = useUIStore();
    const colorTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';

    return (
        <SymbolNewsWidgetInner key={`${symbol}-${colorTheme}`} symbol={symbol} colorTheme={colorTheme} />
    );
});

SymbolNewsWidget.displayName = 'SymbolNewsWidget';
