package com.stockapp.crawlservice.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Crawlservice.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private Api api = new Api();
    private Stock stock = new Stock();
    private StockService stockService = new StockService();
    private NewsService newsService = new NewsService();
    private Crawl crawl = new Crawl();
    private UserService userService = new UserService();
    private NotificationService notificationService = new NotificationService();
    private Security security = new Security();

    public Api getApi() {
        return api;
    }

    public void setApi(Api api) {
        this.api = api;
    }

    public Stock getStock() {
        return stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }

    public StockService getStockService() {
        return stockService;
    }

    public void setStockService(StockService stockService) {
        this.stockService = stockService;
    }

    public NewsService getNewsService() {
        return newsService;
    }

    public void setNewsService(NewsService newsService) {
        this.newsService = newsService;
    }

    public Crawl getCrawl() {
        return crawl;
    }

    public void setCrawl(Crawl crawl) {
        this.crawl = crawl;
    }

    public UserService getUserService() {
        return userService;
    }

    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    public NotificationService getNotificationService() {
        return notificationService;
    }

    public void setNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public Security getSecurity() {
        return security;
    }

    public void setSecurity(Security security) {
        this.security = security;
    }

    {
        this.notificationService = notificationService;
    }

    public static class Api {
        private ApiConfig twelveData = new ApiConfig();
        private ApiConfig finnhub = new ApiConfig();
        private ApiConfig marketaux = new ApiConfig();

        public ApiConfig getTwelveData() {
            return twelveData;
        }

        public void setTwelveData(ApiConfig twelveData) {
            this.twelveData = twelveData;
        }

        public ApiConfig getFinnhub() {
            return finnhub;
        }

        public void setFinnhub(ApiConfig finnhub) {
            this.finnhub = finnhub;
        }

        public ApiConfig getMarketaux() {
            return marketaux;
        }

        public void setMarketaux(ApiConfig marketaux) {
            this.marketaux = marketaux;
        }
    }

    public static class ApiConfig {
        private String baseUrl;
        private String apiKey;

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }
    }

    public static class Stock {
        private List<String> symbols;

        public List<String> getSymbols() {
            return symbols;
        }

        public void setSymbols(List<String> symbols) {
            this.symbols = symbols;
        }
    }

    public static class StockService {
        private String url;

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    public static class NewsService {
        private String url;

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    public static class Crawl {
        private Historical historical = new Historical();
        private StartupBackfill startupBackfill = new StartupBackfill();
        private Schedule schedule = new Schedule();

        public Historical getHistorical() {
            return historical;
        }

        public void setHistorical(Historical historical) {
            this.historical = historical;
        }

        public StartupBackfill getStartupBackfill() {
            return startupBackfill;
        }

        public void setStartupBackfill(StartupBackfill startupBackfill) {
            this.startupBackfill = startupBackfill;
        }

        public Schedule getSchedule() {
            return schedule;
        }

        public void setSchedule(Schedule schedule) {
            this.schedule = schedule;
        }
    }

    public static class StartupBackfill {
        private boolean enabled = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
    }

    public static class Historical {
        private boolean enabled = true;
        private String startDate;
        private String interval;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getStartDate() {
            return startDate;
        }

        public void setStartDate(String startDate) {
            this.startDate = startDate;
        }

        public String getInterval() {
            return interval;
        }

        public void setInterval(String interval) {
            this.interval = interval;
        }
    }

    public static class Schedule {
        private String dailyQuote;
        private String weeklyRecommendation;
        private String weeklyCompanyProfile;
        private String dailyNews;

        public String getDailyQuote() {
            return dailyQuote;
        }

        public void setDailyQuote(String dailyQuote) {
            this.dailyQuote = dailyQuote;
        }

        public String getWeeklyRecommendation() {
            return weeklyRecommendation;
        }

        public void setWeeklyRecommendation(String weeklyRecommendation) {
            this.weeklyRecommendation = weeklyRecommendation;
        }

        public String getWeeklyCompanyProfile() {
            return weeklyCompanyProfile;
        }

        public void setWeeklyCompanyProfile(String weeklyCompanyProfile) {
            this.weeklyCompanyProfile = weeklyCompanyProfile;
        }

        public String getDailyNews() {
            return dailyNews;
        }

        public void setDailyNews(String dailyNews) {
            this.dailyNews = dailyNews;
        }
    }

    public static class UserService {
        private String url;

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    public static class NotificationService {
        private String url;

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    public static class Security {
        private Encryption encryption = new Encryption();

        public Encryption getEncryption() {
            return encryption;
        }

        public void setEncryption(Encryption encryption) {
            this.encryption = encryption;
        }

        public static class Encryption {
            private String masterKey;
            private String salt = "StockAppEncryptionSalt2024";

            public String getMasterKey() {
                return masterKey;
            }

            public void setMasterKey(String masterKey) {
                this.masterKey = masterKey;
            }

            public String getSalt() {
                return salt;
            }

            public void setSalt(String salt) {
                this.salt = salt;
            }
        }
    }
}
