package com.ali.controller;

import com.ali.entity.User;
import com.ali.payload.request.Verify2FARequest;
import com.ali.payload.response.Enable2FAResponse;
import com.ali.payload.response.MessageResponse;
import com.ali.security.jwt.JwtUtils;
import com.ali.security.services.UserDetailsImpl;
import com.ali.service.MFAService;
import com.ali.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class MFAController {

    @Autowired
    private MFAService mfaService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/2fa-status")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> get2FAStatus(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.findById(userDetails.getId());
        return ResponseEntity.ok(mfaService.isMFAEnabled(user));
    }

    @PostMapping("/generate-2fa-secret")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> generate2FASecret(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.findById(userDetails.getId());

        String secret = mfaService.generateSecret();
        String qrCode = mfaService.generateQrCodeImageUri(secret, user.getEmail());

        return ResponseEntity.ok(new Enable2FAResponse(secret, qrCode));
    }

    @PostMapping("/verify-2fa")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> verify2FA(@RequestBody Verify2FARequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.findById(userDetails.getId());

        if (mfaService.verifyCode(request.getSecret(), request.getCode())) {
            mfaService.enableMFA(user, request.getSecret());
            userService.save(user);
            return ResponseEntity.ok(new MessageResponse("2FA enabled successfully!"));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("Invalid verification code"));
    }

    @PostMapping("/disable-2fa")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> disable2FA(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.findById(userDetails.getId());

        mfaService.disableMFA(user);
        userService.save(user);

        return ResponseEntity.ok(new MessageResponse("2FA disabled successfully!"));
    }
} 