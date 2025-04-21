package com.ali.controller;

import com.ali.entity.User;
import com.ali.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public/user")
public class PublicUserController {
    @Autowired
    private UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<?> getPublicUser(@PathVariable String username) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("message", "User not found"));
        }
        User user = userOpt.get();
        Map<String, Object> result = new HashMap<>();
        result.put("username", user.getUsername());
        result.put("mfaEnabled", user.isMfaEnabled());
        return ResponseEntity.ok(result);
    }
} 