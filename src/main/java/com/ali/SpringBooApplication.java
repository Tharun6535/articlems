package com.ali;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Autowired;
import com.ali.entity.User;
import com.ali.entity.Role;
import com.ali.entity.ERole;
import com.ali.repository.UserRepository;
import com.ali.repository.RoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.HashSet;
import org.springframework.core.env.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Arrays;

@SpringBootApplication
public class SpringBooApplication {

    private static final Logger logger = LoggerFactory.getLogger(SpringBooApplication.class);

    public static void main(String[] args) {
        Environment env = SpringApplication.run(SpringBooApplication.class, args).getEnvironment();
        
        String protocol = "http";
        if (env.getProperty("server.ssl.key-store") != null) {
            protocol = "https";
        }
        
        String serverPort = env.getProperty("server.port");
        String contextPath = env.getProperty("server.servlet.context-path", "/");
        if (!contextPath.startsWith("/")) {
            contextPath = "/" + contextPath;
        }
        if (!contextPath.endsWith("/")) {
            contextPath += "/";
        }
        
        logger.info("\n----------------------------------------------------------\n\t" +
                "Application '{}' is running! Access URLs:\n\t" +
                "Local: \t\t{}://localhost:{}{}\n\t" +
                "Profile(s): \t{}\n----------------------------------------------------------",
            env.getProperty("spring.application.name"),
            protocol,
            serverPort,
            contextPath,
            Arrays.toString(env.getActiveProfiles()));
    }
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

    @Bean
    public CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("deiadmin")) {
                Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                        .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_ADMIN)));
                User admin = new User("deiadmin", "deiadmin@example.com", passwordEncoder.encode("admin123"));
                HashSet<Role> roles = new HashSet<>();
                roles.add(adminRole);
                admin.setRoles(roles);
                userRepository.save(admin);
                System.out.println("Default admin user created: deiadmin / admin123");
            }
        };
    }
}
