package com.stockapp.aitoolsservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.util.List;
import java.util.ArrayList;

/**
 * Properties specific to Aitoolsservice.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private Gemini gemini = new Gemini();
    private StockService stockService = new StockService();
    private Finnhub finnhub = new Finnhub();
    private List<String> symbols = new ArrayList<>();
    private Security security = new Security();

    public Gemini getGemini() {
        return gemini;
    }

    public void setGemini(Gemini gemini) {
        this.gemini = gemini;
    }

    public StockService getStockService() {
        return stockService;
    }

    public void setStockService(StockService stockService) {
        this.stockService = stockService;
    }

    public Finnhub getFinnhub() {
        return finnhub;
    }

    public void setFinnhub(Finnhub finnhub) {
        this.finnhub = finnhub;
    }

    public List<String> getSymbols() {
        return symbols;
    }

    public void setSymbols(List<String> symbols) {
        this.symbols = symbols;
    }

    public Security getSecurity() {
        return security;
    }

    public void setSecurity(Security security) {
        this.security = security;
    }

    public static class Gemini {
        private String apiKey;
        private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";

        // Legacy fallback (for backward compatibility)
        // NOTE: Gemma models require "-it" suffix (instruction-tuned)
        private String model = "gemma-3-12b-it";
        private List<String> fallbackModels = List.of(
                "gemma-3-12b-it",
                "gemma-3-4b-it",
                "gemini-2.0-flash-lite");

        // AI_CHAT: gemma-3-12b-it (optimized for speed)
        private String chatModel = "gemma-3-12b-it";
        private List<String> chatFallbackModels = List.of(
                "gemma-3-12b-it",
                "gemma-3-4b-it",
                "gemma-3-1b-it",
                "gemini-2.0-flash-lite",
                "gemini-2.0-flash");

        // AI_INSIGHTS: gemma-3-27b-it (optimized for reasoning)
        private String insightsModel = "gemma-3-27b-it";
        private List<String> insightsFallbackModels = List.of(
                "gemma-3-27b-it",
                "gemma-3-12b-it",
                "gemma-3-4b-it",
                "gemini-2.0-flash",
                "gemini-2.5-flash");

        // AI_RESEARCH: gemma-3-27b-it (optimized for depth)
        private String researchModel = "gemma-3-27b-it";
        private List<String> researchFallbackModels = List.of(
                "gemma-3-27b-it",
                "gemma-3-12b-it",
                "gemma-3-4b-it",
                "gemini-2.0-flash",
                "gemini-2.5-flash");

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public List<String> getFallbackModels() {
            return fallbackModels;
        }

        public void setFallbackModels(List<String> fallbackModels) {
            this.fallbackModels = fallbackModels;
        }

        // Chat model getters/setters
        public String getChatModel() {
            return chatModel;
        }

        public void setChatModel(String chatModel) {
            this.chatModel = chatModel;
        }

        public List<String> getChatFallbackModels() {
            return chatFallbackModels;
        }

        public void setChatFallbackModels(List<String> chatFallbackModels) {
            this.chatFallbackModels = chatFallbackModels;
        }

        // Insights model getters/setters
        public String getInsightsModel() {
            return insightsModel;
        }

        public void setInsightsModel(String insightsModel) {
            this.insightsModel = insightsModel;
        }

        public List<String> getInsightsFallbackModels() {
            return insightsFallbackModels;
        }

        public void setInsightsFallbackModels(List<String> insightsFallbackModels) {
            this.insightsFallbackModels = insightsFallbackModels;
        }

        // Research model getters/setters
        public String getResearchModel() {
            return researchModel;
        }

        public void setResearchModel(String researchModel) {
            this.researchModel = researchModel;
        }

        public List<String> getResearchFallbackModels() {
            return researchFallbackModels;
        }

        public void setResearchFallbackModels(List<String> researchFallbackModels) {
            this.researchFallbackModels = researchFallbackModels;
        }
    }

    public static class StockService {
        private String url = "http://stockservice:8083";

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }

    public static class Finnhub {
        private String baseUrl = "https://finnhub.io/api/v1";
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
