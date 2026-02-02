import { useEffect, useRef, memo } from 'react';
import { useUIStore } from '@/stores/ui-store';

interface MiniChartWidgetProps {
    symbol: string;
    width?: string | number;
    height?: string | number;
}

export const MiniChartWidget = memo(({ symbol, width = '100%', height = 220 }: MiniChartWidgetProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useUIStore();

    useEffect(() => {
        if (!containerRef.current) return;

        // Clean up previous content to avoid duplicates
        containerRef.current.innerHTML = '';

        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbol": symbol,
            "width": width,
            "height": height,
            "locale": "vi_VN",
            "dateRange": "12M",
            "colorTheme": isDark ? "dark" : "light",
            "isTransparent": true,
            "autosize": false,
            "largeChartUrl": "",
            "chartOnly": false,
            "noTimeScale": false
        });

        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container__widget';
        containerRef.current.appendChild(widgetContainer);

        const copyrightContainer = document.createElement('div');
        copyrightContainer.className = 'tradingview-widget-copyright';
        copyrightContainer.style.fontSize = '11px';
        copyrightContainer.style.opacity = '0.6';
        copyrightContainer.innerHTML = `<a href="https://www.tradingview.com/symbols/${symbol.replace(':', '-')}/" rel="noopener nofollow" target="_blank"><span class="blue-text">${symbol.split(':')[1]}</span></a>`;
        containerRef.current.appendChild(copyrightContainer);

        containerRef.current.appendChild(script);

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };

    }, [symbol, theme, width, height]);

    return (
        <div
            className="tradingview-widget-container w-full h-full"
            ref={containerRef}
        />
    );
});

MiniChartWidget.displayName = 'MiniChartWidget';
