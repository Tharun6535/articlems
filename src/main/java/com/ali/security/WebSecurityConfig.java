package com.ali.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ali.security.jwt.AuthEntryPointJwt;
import com.ali.security.jwt.AuthTokenFilter;
import com.ali.security.services.UserDetailsServiceImpl;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {
    
    @Autowired
    UserDetailsServiceImpl userDetailsService;
    
    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;
    
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> 
                auth
                    // Fully permit static resources
                    .requestMatchers(new AntPathRequestMatcher("/")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/index.html")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/welcome.html")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/css/**")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/js/**")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/favicon.ico")).permitAll()
                    // Auth endpoints
                    .requestMatchers(new AntPathRequestMatcher("/api/auth/**")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/api/test/**")).permitAll()
                    // MFA endpoints
                    .requestMatchers(new AntPathRequestMatcher("/api/mfa/**")).permitAll()
                    // Categories endpoint (public access)
                    .requestMatchers(new AntPathRequestMatcher("/api/categories")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/api/categories/paged")).permitAll()
                    // H2 console
                    .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll()
                    // Swagger
                    .requestMatchers(new AntPathRequestMatcher("/swagger-ui/**")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/v3/api-docs/**")).permitAll()
                    // Public user info for forgot password
                    .requestMatchers(new AntPathRequestMatcher("/api/public/user/**")).permitAll()
                    // Secured endpoints
                    .requestMatchers(new AntPathRequestMatcher("/api/articles/**")).authenticated()
                    .requestMatchers(new AntPathRequestMatcher("/api/comments/**")).authenticated()
                    .anyRequest().authenticated()
            );
        
        // Disable frameOptions to allow H2 console to work
        http.headers(headers -> headers.frameOptions(frameOption -> frameOption.disable()));
        
        http.authenticationProvider(authenticationProvider());
        
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
} 