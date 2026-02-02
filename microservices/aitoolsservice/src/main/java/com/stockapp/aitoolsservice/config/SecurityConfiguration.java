package com.stockapp.aitoolsservice.config;

import static org.springframework.security.config.Customizer.withDefaults;
import static org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers.pathMatchers;

import com.stockapp.aitoolsservice.security.AuthoritiesConstants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.header.ReferrerPolicyServerHttpHeadersWriter;
import org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter.Mode;
import org.springframework.security.web.server.savedrequest.NoOpServerRequestCache;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.OrServerWebExchangeMatcher;
import tech.jhipster.config.JHipsterProperties;

@Configuration
@EnableReactiveMethodSecurity
public class SecurityConfiguration {

    private final JHipsterProperties jHipsterProperties;

    public SecurityConfiguration(JHipsterProperties jHipsterProperties) {
        this.jHipsterProperties = jHipsterProperties;
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .securityMatcher(
                        new NegatedServerWebExchangeMatcher(
                                new OrServerWebExchangeMatcher(
                                        pathMatchers("/app/**", "/i18n/**", "/content/**", "/swagger-ui/**"))))
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives(jHipsterProperties.getSecurity().getContentSecurityPolicy()))
                        .frameOptions(frameOptions -> frameOptions.mode(Mode.DENY))
                        .referrerPolicy(referrer -> referrer.policy(
                                ReferrerPolicyServerHttpHeadersWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        .permissionsPolicy(permissions -> permissions.policy(
                                "camera=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), sync-xhr=()")))
                .requestCache(cache -> cache.requestCache(NoOpServerRequestCache.getInstance()))
                .authorizeExchange(authz ->
                // prettier-ignore
                authz
                        // Public endpoints - no authentication required
                        .pathMatchers("/api/authenticate").permitAll()
                        .pathMatchers("/api/public/**").permitAll()
                        // Admin endpoints - require ROLE_ADMIN
                        .pathMatchers("/api/admin/**").hasAuthority(AuthoritiesConstants.ADMIN)
                        // All other API endpoints require authentication
                        .pathMatchers("/api/**").authenticated()
                        // Swagger/OpenAPI documentation
                        .pathMatchers("/v3/api-docs/**").permitAll()
                        .pathMatchers("/swagger-ui.html").permitAll()
                        .pathMatchers("/swagger-ui/**").permitAll()
                        // Actuator endpoints
                        .pathMatchers("/management/health").permitAll()
                        .pathMatchers("/management/health/**").permitAll()
                        .pathMatchers("/management/info").permitAll()
                        .pathMatchers("/management/prometheus").permitAll()
                        .pathMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN))
                .httpBasic(basic -> basic.disable())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()));
        return http.build();
    }
}
