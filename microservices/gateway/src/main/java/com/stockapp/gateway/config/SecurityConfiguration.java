package com.stockapp.gateway.config;

import static org.springframework.security.config.Customizer.withDefaults;
import static org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers;

import com.stockapp.gateway.security.AuthoritiesConstants;
import com.stockapp.gateway.web.filter.SpaWebFilter;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.MapReactiveUserDetailsService;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.header.ReferrerPolicyServerHttpHeadersWriter;
import org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter.Mode;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.OrServerWebExchangeMatcher;
import org.springframework.util.StringUtils;
import tech.jhipster.config.JHipsterProperties;

@Configuration
@EnableReactiveMethodSecurity
public class SecurityConfiguration {

        private final JHipsterProperties jHipsterProperties;

        public SecurityConfiguration(JHipsterProperties jHipsterProperties) {
                this.jHipsterProperties = jHipsterProperties;
        }

        @Bean
        public MapReactiveUserDetailsService userDetailsService(SecurityProperties properties) {
                SecurityProperties.User user = properties.getUser();
                UserDetails userDetails = User.withUsername(user.getName())
                                .password("{noop}" + user.getPassword())
                                .roles(StringUtils.toStringArray(user.getRoles()))
                                .build();
                return new MapReactiveUserDetailsService(userDetails);
        }

        @Bean
        public ReactiveAuthenticationManager reactiveAuthenticationManager(
                        ReactiveUserDetailsService userDetailsService) {
                return new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService);
        }

        @Bean
        public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
                http
                                .securityMatcher(
                                                new NegatedServerWebExchangeMatcher(
                                                                new OrServerWebExchangeMatcher(
                                                                                pathMatchers("/app/**", "/i18n/**",
                                                                                                "/content/**",
                                                                                                "/swagger-ui/**"))))
                                .cors(withDefaults())
                                .csrf(csrf -> csrf.disable())
                                .addFilterAfter(new SpaWebFilter(), SecurityWebFiltersOrder.HTTPS_REDIRECT)
                                .headers(headers -> headers
                                                .contentSecurityPolicy(csp -> csp
                                                                .policyDirectives(jHipsterProperties.getSecurity()
                                                                                .getContentSecurityPolicy()))
                                                .frameOptions(frameOptions -> frameOptions.mode(Mode.DENY))
                                                .referrerPolicy(referrer -> referrer.policy(
                                                                ReferrerPolicyServerHttpHeadersWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                                                .permissionsPolicy(permissions -> permissions.policy(
                                                                "camera=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), sync-xhr=()")))
                                .authorizeExchange(authz ->
                                // prettier-ignore
                                authz
                                                // Allow CORS preflight requests
                                                .pathMatchers(HttpMethod.OPTIONS).permitAll()
                                                .pathMatchers("/").permitAll()
                                                .pathMatchers("/*.*").permitAll()
                                                // Gateway authentication endpoints
                                                .pathMatchers("/api/authenticate").permitAll()
                                                .pathMatchers("/api/register").permitAll()
                                                .pathMatchers("/api/activate").permitAll()
                                                .pathMatchers("/api/account/reset-password/**").permitAll()
                                                // UserService public endpoints
                                                .pathMatchers("/services/userservice/api/auth/register").permitAll()
                                                .pathMatchers("/services/userservice/api/auth/activate").permitAll()
                                                .pathMatchers("/services/userservice/api/auth/login").permitAll()
                                                .pathMatchers("/services/userservice/api/auth/forgot-password")
                                                .permitAll()
                                                .pathMatchers("/services/userservice/api/auth/reset-password")
                                                .permitAll()
                                                .pathMatchers("/services/userservice/api/auth/resend-activation")
                                                .permitAll()
                                                .pathMatchers("/services/userservice/api/public/**").permitAll()
                                                // StockService public endpoints
                                                .pathMatchers("/services/stockservice/api/public/**").permitAll()
                                                .pathMatchers("/services/stockservice/api/stock-quotes/**").permitAll()
                                                .pathMatchers("/services/stockservice/api/historical-data/**")
                                                .permitAll()
                                                .pathMatchers("/services/stockservice/api/trending-stocks/**")
                                                .permitAll()
                                                // NewsService public endpoints
                                                .pathMatchers("/services/newsservice/api/public/**").permitAll()
                                                .pathMatchers("/services/newsservice/api/news/**").permitAll()
                                                // NotificationService public endpoints
                                                .pathMatchers("/services/notificationservice/api/public/**").permitAll()
                                                // CrawlService public endpoints
                                                .pathMatchers("/services/crawlservice/api/public/**").permitAll()
                                                // AIToolsService public endpoints
                                                .pathMatchers("/services/aitoolsservice/api/public/**").permitAll()
                                                // AIService (Python) public endpoints
                                                .pathMatchers("/services/aiservice/api/**").permitAll()
                                                // Admin endpoints
                                                .pathMatchers("/api/admin/**").hasAuthority(AuthoritiesConstants.ADMIN)
                                                // Protected Gateway endpoints
                                                .pathMatchers("/api/**").authenticated()
                                                // Health and monitoring
                                                .pathMatchers("/services/*/management/health/readiness").permitAll()
                                                .pathMatchers("/services/*/v3/api-docs")
                                                .hasAuthority(AuthoritiesConstants.ADMIN)
                                                // All other service endpoints require authentication
                                                .pathMatchers("/services/**").authenticated()
                                                // API docs
                                                .pathMatchers("/v3/api-docs/**")
                                                .hasAuthority(AuthoritiesConstants.ADMIN)
                                                .pathMatchers("/management/health").permitAll()
                                                .pathMatchers("/management/health/**").permitAll()
                                                .pathMatchers("/management/info").permitAll()
                                                .pathMatchers("/management/prometheus").permitAll()
                                                .pathMatchers("/management/**")
                                                .hasAuthority(AuthoritiesConstants.ADMIN))
                                .httpBasic(basic -> basic.disable())
                                .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()));
                return http.build();
        }
}
