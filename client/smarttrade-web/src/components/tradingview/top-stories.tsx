import { useEffect, useRef, memo } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { Card } from '@/components/ui/card';

// Widget using TradingView's exact original pattern
const TopStoriesWidget = memo(({ colorTheme }: { colorTheme: 'dark' | 'light' }) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
        script.type = "text/javascript";
        script.async = true;
        // Using TradingView's original settings with feedMode: all_symbols
        script.innerHTML = `
        {
          "displayMode": "regular",
          "feedMode": "all_symbols",
          "colorTheme": "${colorTheme}",
          "isTransparent": false,
          "locale": "en",
          "width": "100%",
          "height": "100%"
        }`;
        container.current.appendChild(script);
    }, []);

    return (
        <div className="tradingview-widget-container h-full w-full" ref={container} style={{ width: '100%', height: '100%' }}>
            <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
            <div className="tradingview-widget-copyright">
                <a href="https://vn.tradingview.com/" rel="noopener nofollow" target="_blank">
                    <span className="blue-text">Tin tức thị trường</span>
                </a>
            </div>
        </div>
    );
});

TopStoriesWidget.displayName = 'TopStoriesWidget';

// Wrapper that forces remount when theme changes
export const TopStories = memo(() => {
    const { theme } = useUIStore();
    const colorTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';

    return (
        <Card className="h-full overflow-hidden bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
            <TopStoriesWidget key={colorTheme} colorTheme={colorTheme} />
        </Card>
    );
});

TopStories.displayName = 'TopStories';


