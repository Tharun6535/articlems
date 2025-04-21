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

@SpringBootApplication
public class SpringBooApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBooApplication.class, args);
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
