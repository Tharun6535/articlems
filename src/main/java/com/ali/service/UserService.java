package com.ali.service;

import com.ali.entity.User;
import java.util.Optional;

public interface UserService {
    User findById(Long id);
    Optional<User> findByUsername(String username);
    User save(User user);
    Optional<User> findByEmail(String email);
    void updatePassword(User user, String newPassword);
} 