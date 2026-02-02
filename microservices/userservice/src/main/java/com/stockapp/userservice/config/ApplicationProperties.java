package com.stockapp.userservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Userservice.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private String baseUrl;
    private final Security security = new Security();

    // jhipster-needle-application-properties-property

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public Security getSecurity() {
        return security;
    }

    // jhipster-needle-application-properties-property-getter

    /**
     * Security configuration properties.
     */
    public static class Security {
        private final Encryption encryption = new Encryption();

        public Encryption getEncryption() {
            return encryption;
        }

        /**
         * Field-level encryption configuration.
         */
        public static class Encryption {
            /**
             * Master key for AES-256 encryption.
             * Should be set via environment variable in production.
             */
            private String masterKey;

            /**
             * Salt for key derivation (PBKDF2).
             */
            private String salt = "StockAppUserServiceSalt2024";

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

    // jhipster-needle-application-properties-property-class
}
