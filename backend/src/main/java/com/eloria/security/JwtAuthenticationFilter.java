package com.eloria.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Authenticates requests carrying {@code Authorization: Bearer <jwt>}. An invalid or expired token never
 * fails the request here: the request simply stays anonymous, so public endpoints keep working and
 * protected ones answer 401 through {@link RestAuthenticationEntryPoint}.
 * <p>
 * Created by {@code SecurityConfig} (not a bean) so it only runs inside the security filter chain.
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    static final String TOKEN_REJECTED_ATTRIBUTE = "eloria.jwt.rejected";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final AppUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(BEARER_PREFIX)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(BEARER_PREFIX.length()).trim();
            jwtService.verify(token).ifPresentOrElse(claims -> {
                try {
                    // Reload the account so deleted users or changed roles take effect immediately.
                    AppUserDetails user = userDetailsService.loadUserByUsername(claims.getSubject());
                    var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (UsernameNotFoundException e) {
                    request.setAttribute(TOKEN_REJECTED_ATTRIBUTE, Boolean.TRUE);
                }
            }, () -> request.setAttribute(TOKEN_REJECTED_ATTRIBUTE, Boolean.TRUE));
        }
        chain.doFilter(request, response);
    }
}
