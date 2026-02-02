package com.stockapp.newsservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Newsservice.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private Security security = new Security();

    public Security getSecurity() {
        return security;
    }

    public void setSecurity(Security security) {
        this.security = security;
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

    // jhipster-needle-application-properties-property

    // jhipster-needle-application-properties-property-getter

    // jhipster-needle-application-properties-property-class
}
