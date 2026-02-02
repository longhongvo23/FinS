import { useEffect, useRef, memo } from 'react';
import { useUIStore } from '@/stores/ui-store';

interface FundamentalDataWidgetProps {
    symbol: string;
}

// Inner widget component
const FundamentalDataWidgetInner = memo(({ symbol, colorTheme }: { symbol: string; colorTheme: 'dark' | 'light' }) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-financials.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
        {
          "isTransparent": true,
          "largeChartUrl": "",
          "displayMode": "regular",
          "width": "100%",
          "height": "100%",
          "colorTheme": "${colorTheme}",
          "symbol": "${symbol}",
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

FundamentalDataWidgetInner.displayName = 'FundamentalDataWidgetInner';

// Wrapper component that handles theme changes
export const FundamentalDataWidget = memo(({ symbol }: FundamentalDataWidgetProps) => {
    const { theme } = useUIStore();
    const colorTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';

    return (
        <FundamentalDataWidgetInner key={`${symbol}-${colorTheme}`} symbol={symbol} colorTheme={colorTheme} />
    );
});

FundamentalDataWidget.displayName = 'FundamentalDataWidget';
