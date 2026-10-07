package com.example.courseselect.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    public static final String ROLE_STUDENT = "student";
    public static final String ROLE_ADMIN = "admin";

    public record TokenInfo(Long userId, String role) {
    }

    private final SecretKey key;
    private final long expireMillis;

    public JwtUtil(@Value("${app.jwt.secret}") String secret,
                   @Value("${app.jwt.expire-hours}") long expireHours) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expireMillis = expireHours * 3600_000L;
    }

    public String createToken(Long userId, String userNo, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("userNo", userNo)
                .claim("role", role)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expireMillis))
                .signWith(key)
                .compact();
    }

    /** 校验并解析 token；无效时抛出异常 */
    public TokenInfo parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return new TokenInfo(Long.valueOf(claims.getSubject()), String.valueOf(claims.get("role")));
    }
}
