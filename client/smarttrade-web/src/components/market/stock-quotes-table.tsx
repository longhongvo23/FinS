import { useEffect, useState, memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Loader2, RefreshCw, Star, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { watchlistService } from '@/services/watchlist-service';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

// Finnhub API key (same as crawlservice)
const FINNHUB_API_KEY = 'd3su1ohr01qpdd5lapsgd3su1ohr01qpdd5lapt0';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

interface FinnhubQuote {
    c: number;  // Current price
    d: number;  // Change
    dp: number; // Percent change
    h: number;  // High price of the day
    l: number;  // Low price of the day
    o: number;  // Open price of the day
    pc: number; // Previous close price
    t: number;  // Timestamp
}

interface FinnhubProfile {
    logo: string;
    name: string;
}

interface StockQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    previousClose: number;
    logo: string;
}

type SortColumn = 'price' | 'change' | 'changePercent' | 'open' | 'high' | 'low' | 'previousClose' | null;
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'gainers' | 'losers';

const WATCHED_STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc' },
    { symbol: 'NVDA', name: 'NVIDIA Corp' },
    { symbol: 'MSFT', name: 'Microsoft Corp' },
    { symbol: 'AMZN', name: 'Amazon.com Inc' },
    { symbol: 'TSLA', name: 'Tesla Inc' },
    { symbol: 'META', name: 'Meta Platforms' },
    { symbol: 'GOOGL', name: 'Alphabet Inc' },
];

async function fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
    try {
        const response = await fetch(
            `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.c === 0 && data.pc === 0) {
            return null;
        }
        return data;
    } catch (error) {
        console.error(`Failed to fetch quote for ${symbol}:`, error);
        return null;
    }
}

async function fetchFinnhubProfile(symbol: string): Promise<FinnhubProfile | null> {
    try {
        const response = await fetch(
            `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to fetch profile for ${symbol}:`, error);
        return null;
    }
}

// Sortable column header component
interface SortableHeaderProps {
    column: SortColumn;
    currentSort: SortColumn;
    currentDirection: SortDirection;
    onSort: (column: SortColumn) => void;
    children: React.ReactNode;
    className?: string;
}

function SortableHeader({ column, currentSort, currentDirection, onSort, children, className }: SortableHeaderProps) {
    const isActive = currentSort === column;

    return (
        <th
            className={cn(
                'py-4 px-3 text-sm font-semibold text-[var(--color-text-secondary)] whitespace-nowrap cursor-pointer hover:text-[var(--color-text-primary)] transition-colors select-none',
                className
            )}
            onClick={() => onSort(column)}
        >
            <div className="flex items-center justify-end gap-1">
                <span>{children}</span>
                {isActive ? (
                    currentDirection === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    )
                ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                )}
            </div>
        </th>
    );
}

export const StockQuotesTable = memo(() => {
    const [quotes, setQuotes] = useState<StockQuote[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
    const [togglingSymbol, setTogglingSymbol] = useState<string | null>(null);

    // Sorting state
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Filter state
    const [filter, setFilter] = useState<FilterType>('all');

    const { isAuthenticated, isGuest } = useAuthStore();

    const fetchWatchlistStatus = useCallback(async () => {
        if (!isAuthenticated || isGuest) return;
        try {
            const list = await watchlistService.getWatchlist();
            setWatchlist(new Set(list.map(item => item.symbol)));
        } catch (error) {
        }
    }, [isAuthenticated, isGuest]);

    const fetchQuotes = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        }

        try {
            // Fetch quotes and profiles for all symbols in parallel
            const dataPromises = WATCHED_STOCKS.map(async (stock) => {
                const [quote, profile] = await Promise.all([
                    fetchFinnhubQuote(stock.symbol),
                    fetchFinnhubProfile(stock.symbol),
                ]);
                return {
                    symbol: stock.symbol,
                    name: profile?.name || stock.name,
                    price: quote?.c || 0,
                    change: quote?.d || 0,
                    changePercent: quote?.dp || 0,
                    open: quote?.o || 0,
                    high: quote?.h || 0,
                    low: quote?.l || 0,
                    previousClose: quote?.pc || 0,
                    logo: profile?.logo || '',
                };
            });

            const results = await Promise.all(dataPromises);

            const validQuotes = results.filter((q) => q.price > 0);

            if (validQuotes.length === 0) {
                setError('Không có dữ liệu. Thị trường có thể đang đóng cửa.');
            } else {
                setQuotes(results);
                setError(null);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error('Failed to fetch quotes:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const toggleWatchlist = async (symbol: string) => {
        if (!isAuthenticated || isGuest) {
            toast.error('Vui lòng đăng nhập để thêm vào danh sách theo dõi');
            return;
        }

        setTogglingSymbol(symbol);
        try {
            if (watchlist.has(symbol)) {
                await watchlistService.removeFromWatchlist(symbol);
                setWatchlist(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(symbol);
                    return newSet;
                });
                toast.success(`Đã xóa ${symbol} khỏi danh sách theo dõi`);
            } else {
                await watchlistService.addToWatchlist(symbol);
                setWatchlist(prev => new Set(prev).add(symbol));
                toast.success(`Đã thêm ${symbol} vào danh sách theo dõi`);
            }
        } catch (error) {
            toast.error('Không thể cập nhật danh sách theo dõi');
            console.error('Failed to toggle watchlist:', error);
        } finally {
            setTogglingSymbol(null);
        }
    };

    // Handle column sort
    const handleSort = useCallback((column: SortColumn) => {
        if (sortColumn === column) {
            if (sortDirection === 'desc') {
                // First click was desc, now switch to asc
                setSortDirection('asc');
            } else {
                // Second click was asc, now reset to no sort
                setSortColumn(null);
                setSortDirection('desc');
            }
        } else {
            // New column, start with descending (show highest first)
            setSortColumn(column);
            setSortDirection('desc');
        }
    }, [sortColumn, sortDirection]);

    // Filtered and sorted quotes
    const filteredAndSortedQuotes = useMemo(() => {
        // First, filter
        let result = quotes;
        if (filter === 'gainers') {
            result = quotes.filter(q => q.changePercent > 0);
        } else if (filter === 'losers') {
            result = quotes.filter(q => q.changePercent < 0);
        }

        // Then, sort
        if (sortColumn) {
            result = [...result].sort((a, b) => {
                const aValue = a[sortColumn];
                const bValue = b[sortColumn];

                if (sortDirection === 'asc') {
                    return aValue - bValue;
                } else {
                    return bValue - aValue;
                }
            });
        }

        return result;
    }, [quotes, sortColumn, sortDirection, filter]);

    useEffect(() => {
        fetchQuotes();
        fetchWatchlistStatus();
        // Refresh every 30 seconds
        const interval = setInterval(() => fetchQuotes(), 30000);
        return () => clearInterval(interval);
    }, [fetchQuotes, fetchWatchlistStatus]);

    // Reload watchlist when user logs in/out
    useEffect(() => {
        if (isAuthenticated) {
            fetchWatchlistStatus();
        } else {
            // Clear watchlist when user logs out
            setWatchlist(new Set());
        }
    }, [isAuthenticated, fetchWatchlistStatus]);

    const formatPrice = (value: number) => {
        if (value === 0) return '-';
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatPercent = (value: number) => {
        if (value === 0) return '0.00%';
        const formatted = Math.abs(value).toFixed(2);
        return `${value >= 0 ? '+' : '-'}${formatted}%`;
    };

    const formatChange = (value: number) => {
        if (value === 0) return '0.00';
        const formatted = Math.abs(value).toFixed(2);
        return value >= 0 ? `+${formatted}` : `-${formatted}`;
    };

    if (loading) {
        return (
            <Card className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-sm p-8">
                <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--color-text-secondary)]" />
                    <span className="text-[var(--color-text-secondary)] text-base">
                        Đang tải dữ liệu từ Finnhub...
                    </span>
                </div>
            </Card>
        );
    }

    if (error && quotes.length === 0) {
        return (
            <Card className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-sm p-8">
                <div className="text-center">
                    <div className="text-red-500 text-base mb-4">{error}</div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchQuotes(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                        Thử lại
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-sm">
            {/* Header with filter tabs and actions */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
                <div className="flex items-center gap-3">
                    {/* Filter Tabs */}
                    <div className="flex items-center bg-[var(--color-bg-secondary)] rounded-lg p-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                filter === 'all'
                                    ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] shadow-sm'
                                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            )}
                        >
                            Tất cả ({quotes.length})
                        </button>
                        <button
                            onClick={() => setFilter('gainers')}
                            className={cn(
                                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1',
                                filter === 'gainers'
                                    ? 'bg-emerald-500/15 text-emerald-500 shadow-sm'
                                    : 'text-[var(--color-text-secondary)] hover:text-emerald-500'
                            )}
                        >
                            <TrendingUp className="h-3 w-3" />
                            Tăng ({quotes.filter(q => q.changePercent > 0).length})
                        </button>
                        <button
                            onClick={() => setFilter('losers')}
                            className={cn(
                                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1',
                                filter === 'losers'
                                    ? 'bg-red-500/15 text-red-500 shadow-sm'
                                    : 'text-[var(--color-text-secondary)] hover:text-red-500'
                            )}
                        >
                            <TrendingDown className="h-3 w-3" />
                            Giảm ({quotes.filter(q => q.changePercent < 0).length})
                        </button>
                    </div>

                    {/* Sort indicator */}
                    {sortColumn && (
                        <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] px-2 py-1 rounded">
                            {sortColumn === 'price' && 'Giá'}
                            {sortColumn === 'change' && 'Thay đổi'}
                            {sortColumn === 'changePercent' && '% Thay đổi'}
                            {sortColumn === 'open' && 'Mở cửa'}
                            {sortColumn === 'high' && 'Cao'}
                            {sortColumn === 'low' && 'Thấp'}
                            {sortColumn === 'previousClose' && 'Đóng cửa trước'}
                            {' '}{sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="text-xs text-[var(--color-text-secondary)]">
                            Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchQuotes(true)}
                        disabled={refreshing}
                        className="h-7 w-7 p-0"
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-secondary)] whitespace-nowrap">
                                Cổ phiếu
                            </th>
                            <SortableHeader
                                column="price"
                                currentSort={sortColumn}
                                currentDirection={sortDirection}
                                onSort={handleSort}
                                className="text-right"
                            >
                                Giá
                            </SortableHeader>
                            <SortableHeader
                                column="change"
                                currentSort={sortColumn}
                                currentDirection={sortDirection}
                                onSort={handleSort}
                                className="text-right"
                            >
                                Thay đổi
                            </SortableHeader>
                            <SortableHeader
                                column="changePercent"
                                currentSort={sortColumn}
                                currentDirection={sortDirection}
                                onSort={handleSort}
                                className="text-right"
                            >
                                % Thay đổi
                            </SortableHeader>
                            <SortableHeader
                                column="open"
                                currentSort={sortColumn}
                                currentDirection={sortDirection}
                                onSort={handleSort}
                                className="text-right"
                            >
                                Mở cửa
                            </SortableHeader>
                            <SortableHeader
                                column="high"
                                currentSort={sortColumn}
                                currentDirection={sortDirection}
                                onSort={handleSort}
                                className="text-right"
                            >
                                Cao
                            </SortableHeader>
                            <SortableHeader
                                column="low"
                                currentSort={sortColumn}
                                currentDirection={sortDirection}
                                onSort={handleSort}
                                className="text-right"
                            >
                                Thấp
                            </SortableHeader>
                            <SortableHeader
                                column="previousClose"
                                currentSort={sortColumn}
                                currentDirection={sortDirection}
                                onSort={handleSort}
                                className="text-right px-4"
                            >
                                Đóng cửa trước
                            </SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedQuotes.map((quote, index) => (
                            <tr
                                key={quote.symbol}
                                className={cn(
                                    'border-b border-[var(--color-border)]',
                                    index === filteredAndSortedQuotes.length - 1 && 'border-b-0'
                                )}
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        {/* Watchlist Star Button */}
                                        <button
                                            onClick={() => toggleWatchlist(quote.symbol)}
                                            disabled={togglingSymbol === quote.symbol}
                                            className={cn(
                                                'p-1 rounded-md transition-colors hover:bg-[var(--color-bg-tertiary)]',
                                                togglingSymbol === quote.symbol && 'opacity-50 cursor-not-allowed'
                                            )}
                                            title={watchlist.has(quote.symbol) ? 'Xóa khỏi danh sách theo dõi' : 'Thêm vào danh sách theo dõi'}
                                        >
                                            <Star
                                                className={cn(
                                                    'h-5 w-5 transition-colors',
                                                    watchlist.has(quote.symbol)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-[var(--color-text-secondary)] hover:text-yellow-400'
                                                )}
                                            />
                                        </button>

                                        <Link
                                            to={`/stock/${quote.symbol}`}
                                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                        >
                                            {/* Logo */}
                                            {quote.logo ? (
                                                <img
                                                    src={quote.logo}
                                                    alt={quote.name}
                                                    className="w-8 h-8 rounded-full object-contain bg-card border border-[var(--color-border)]"
                                                    onError={(e) => {
                                                        // Fallback to initial letter on error
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={cn(
                                                    'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                                                    quote.change >= 0 ? 'bg-emerald-500' : 'bg-red-500',
                                                    quote.logo && 'hidden'
                                                )}
                                            >
                                                {quote.symbol.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-base font-semibold text-[var(--color-text-primary)]">
                                                    {quote.name}
                                                </div>
                                                <div className="text-sm text-[var(--color-text-secondary)]">
                                                    {quote.symbol}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </td>
                                <td className="text-right py-4 px-3">
                                    <span className="text-base font-medium text-[var(--color-text-primary)]">
                                        {formatPrice(quote.price)}
                                    </span>
                                </td>
                                <td className="text-right py-4 px-3">
                                    <span
                                        className={cn(
                                            'text-base font-medium',
                                            quote.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                                        )}
                                    >
                                        {formatChange(quote.change)}
                                    </span>
                                </td>
                                <td className="text-right py-4 px-3">
                                    <span
                                        className={cn(
                                            'inline-flex items-center justify-center px-2.5 py-1 rounded-md text-sm font-semibold min-w-[70px]',
                                            quote.changePercent >= 0
                                                ? 'bg-emerald-500/15 text-emerald-500'
                                                : 'bg-red-500/15 text-red-500'
                                        )}
                                    >
                                        {formatPercent(quote.changePercent)}
                                    </span>
                                </td>
                                <td className="text-right py-4 px-3">
                                    <span className="text-base text-[var(--color-text-primary)]">
                                        {formatPrice(quote.open)}
                                    </span>
                                </td>
                                <td className="text-right py-4 px-3">
                                    <span className="text-base text-[var(--color-text-primary)]">
                                        {formatPrice(quote.high)}
                                    </span>
                                </td>
                                <td className="text-right py-4 px-3">
                                    <span className="text-base text-[var(--color-text-primary)]">
                                        {formatPrice(quote.low)}
                                    </span>
                                </td>
                                <td className="text-right py-4 px-4">
                                    <span className="text-base text-[var(--color-text-primary)]">
                                        {formatPrice(quote.previousClose)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
});

StockQuotesTable.displayName = 'StockQuotesTable';
