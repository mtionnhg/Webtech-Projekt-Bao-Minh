package htw.webtech.todo_app;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        // Allow specific frontend URLs
        config.addAllowedOrigin("https://content-creator-frontend-ixsj.onrender.com");
        config.addAllowedOrigin("https://webtech-projekt-bao-minh.onrender.com");
        config.addAllowedOriginPattern("https://*.onrender.com"); // Allow all Render subdomains
        config.addAllowedOriginPattern("http://localhost:*"); // Allow localhost for development
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}

