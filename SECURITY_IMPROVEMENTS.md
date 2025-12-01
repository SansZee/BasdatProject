# Security Improvements - Film Dashboard

## Overview
Implemented comprehensive security improvements to protect against XSS, CSRF, brute force attacks, and other common vulnerabilities.

## Changes Made

### 1. JWT Token Storage - httpOnly Cookies ✅
**Problem**: JWT tokens stored in localStorage were vulnerable to XSS attacks.

**Solution**: Moved JWT tokens to httpOnly cookies.
- **Backend**: `auth_handler.go` - Set token in httpOnly cookie on login
  ```go
  http.SetCookie(w, &http.Cookie{
    Name:     "auth_token",
    Value:    response.Token,
    HttpOnly: true,  // JavaScript cannot access
    Secure:   true,  // Only via HTTPS
    SameSite: http.SameSite(3), // Lax mode for CSRF protection
    MaxAge:   24 * 60 * 60,
  })
  ```

- **Frontend**: `axios.ts` - Enable `withCredentials` to send cookies automatically
  ```ts
  withCredentials: true,  // Browser sends httpOnly cookies automatically
  ```

- **Auth Middleware**: Updated to read from cookies first, then fallback to Authorization header
  - `middleware/auth.go` - Modified `Auth()` middleware

**Benefits**:
- XSS Protection: JavaScript cannot access the token
- Automatic Transmission: Browser automatically sends cookie with requests
- CORS Safe: Works seamlessly with CORS via `withCredentials`

---

### 2. Rate Limiting ✅
**Problem**: No protection against brute force attacks on login/register endpoints.

**Solution**: Implemented per-IP rate limiting.
- **File**: `middleware/ratelimit.go`
- **Configuration**: 10 requests per minute per IP
- **Features**:
  - Tracks requests per IP address
  - Supports proxy headers (X-Forwarded-For, X-Real-IP)
  - Auto-cleanup of old entries every 5 minutes
  - Returns `429 Too Many Requests` when limit exceeded

**Applied to**: All routes (global middleware)

---

### 3. CSRF Protection ✅
**Problem**: No CSRF token validation for state-changing requests.

**Solution**: Implemented double-submit cookie CSRF protection.
- **File**: `middleware/csrf.go`
- **Mechanism**:
  1. GET requests: Generate and set CSRF token in cookie
  2. POST/PUT/DELETE: Validate token from header vs cookie
  3. Token stored in `X-CSRF-Token` header or form value

**Frontend TODO**: Add CSRF token to request headers in form submissions
```ts
// Will need to add in future POST/PUT/DELETE requests
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('X-CSRF-Token='))
  ?.split('=')[1];

config.headers['X-CSRF-Token'] = csrfToken;
```

---

### 4. Security Headers ✅
**Problem**: Missing security headers that prevent XSS, clickjacking, MIME sniffing.

**Solution**: Added security headers middleware.
- **File**: `middleware/secureheaders.go`
- **Headers Added**:
  - `X-Content-Type-Options: nosniff` - Prevent MIME type sniffing
  - `X-Frame-Options: DENY` - Prevent clickjacking
  - `X-XSS-Protection: 1; mode=block` - Enable XSS protection
  - `Strict-Transport-Security` - Enforce HTTPS (1 year, includes subdomains)
  - `Content-Security-Policy` - Restrict resource origins
  - `Referrer-Policy` - Control referrer information
  - `Permissions-Policy` - Disable browser features (geolocation, camera, etc.)

---

### 5. Auth Flow Updates ✅

#### Backend Changes:
- **Login Response**: Returns only user data, not token (token is in httpOnly cookie)
- **New Logout Endpoint**: `POST /api/auth/logout` - Clears httpOnly cookie
  - Protected route (requires authentication)
  - Sets `MaxAge: -1` to delete cookie

#### Frontend Changes:
- **storage.ts**: Removed token management, only stores user data
- **AuthContext.tsx**: 
  - Removed token from state
  - Validates auth on app start by calling `/api/auth/profile`
  - Updated `login()` to accept only user data
  - Updated `logout()` to call logout API endpoint
- **LoginPage.tsx**: Updated to match new login signature
- **auth.ts**: 
  - Updated response extraction (`.data.data`)
  - Added `logout()` API method

---

## Implementation Checklist

### Backend ✅
- [x] httpOnly cookie on login
- [x] Auth middleware reads from cookies
- [x] Rate limiting middleware
- [x] CSRF protection middleware
- [x] Security headers middleware
- [x] Logout endpoint
- [x] Apply middlewares to router

### Frontend ✅
- [x] axios `withCredentials: true`
- [x] Remove token from localStorage
- [x] Update storage.ts
- [x] Update AuthContext
- [x] Update LoginPage
- [x] Update auth API

### TODO - Next Steps
- [ ] Add CSRF token to form submissions (if using forms instead of JSON)
- [ ] Test HTTPS enforcement
- [ ] Implement refresh token mechanism (for longer sessions without 24-hour re-login)
- [ ] Add input validation/sanitization on backend (RegisterRequest, LoginRequest)
- [ ] Implement email verification for registration
- [ ] Add password reset flow with secure tokens
- [ ] Implement audit logging for security events
- [ ] Add request signing for API calls (optional)
- [ ] Setup rate limiting exceptions for trusted IPs (admin, internal)

---

## Testing Recommendations

### Test Cases:
1. **httpOnly Cookie**:
   - Login successfully, check DevTools Cookies (auth_token should be HttpOnly)
   - Try to access token from JavaScript console: `document.cookie` should not include auth_token
   - Profile request should work (cookie auto-sent)

2. **Rate Limiting**:
   - Make >10 requests to `/api/auth/login` within 1 minute from same IP
   - Should get `429 Too Many Requests`
   - Wait 1 minute and retry (should work)

3. **CSRF Protection**:
   - GET request should set `X-CSRF-Token` cookie
   - POST request without token should be rejected (403)
   - POST request with mismatched token should be rejected (403)

4. **Security Headers**:
   - Check response headers in browser DevTools
   - Verify CSP policy works (unsafe inline scripts should be blocked if changed)

5. **Logout**:
   - Login successfully
   - Call logout endpoint
   - Verify auth_token cookie is deleted
   - Try to access protected route (should get 401)

---

## Files Modified/Created

### New Files:
- `/backend/internal/middleware/ratelimit.go`
- `/backend/internal/middleware/csrf.go`
- `/backend/internal/middleware/secureheaders.go`

### Modified Files:
- `/backend/cmd/api/main.go`
- `/backend/internal/handler/auth_handler.go`
- `/backend/internal/middleware/auth.go`
- `/frontend/src/utils/axios.ts`
- `/frontend/src/utils/storage.ts`
- `/frontend/src/context/AuthContext.tsx`
- `/frontend/src/api/auth.ts`
- `/frontend/src/pages/LoginPage.tsx`

---

## Security Improvements Summary

| Threat | Before | After | Method |
|--------|--------|-------|--------|
| XSS (token theft) | ❌ localStorage | ✅ httpOnly cookie | Browser protection |
| CSRF attacks | ❌ None | ✅ Token validation | Double-submit cookies |
| Brute force | ❌ None | ✅ Rate limiting | 10 req/min per IP |
| MIME sniffing | ❌ None | ✅ X-Content-Type-Options | Security header |
| Clickjacking | ❌ None | ✅ X-Frame-Options | Security header |
| XSS (general) | ❌ None | ✅ CSP + headers | Multiple layers |
| HTTPS enforcement | ❌ None | ✅ HSTS | Security header |

---

## Architecture Diagram

```
User Browser
  ↓
  ├─ Login Request (username, password)
  │  ↓
  ├─ Backend Validation
  │  ├─ Rate Limit Check
  │  ├─ CSRF Token Check
  │  ├─ Credentials Verification
  │  ↓
  ├─ Set httpOnly Cookie (auth_token)
  │  ├─ HttpOnly: true (XSS protection)
  │  ├─ Secure: true (HTTPS only)
  │  ├─ SameSite: Lax (CSRF protection)
  │  ↓
  ├─ Return User Data (no token in response)
  │  ↓
  ├─ Subsequent Requests
  │  ├─ Browser auto-sends auth_token cookie
  │  ├─ Auth middleware validates token
  │  ├─ Request processed
  │  ↓
  ├─ Logout Request
  │  ├─ Clear httpOnly cookie (MaxAge: -1)
  │  ├─ User data cleared from localStorage
```

---

## Notes

1. **httpOnly Cookies**: Make sure frontend is on same domain or subdomain for cookies to work with CORS
2. **HTTPS**: Secure flag requires HTTPS in production. Disable in development if needed.
3. **Rate Limiting**: Current limit is 10/min. Adjust in `main.go` based on requirements.
4. **CSRF Tokens**: For JSON POST requests, CSRF protection is less critical (same-origin policy applies), but still recommended.
5. **SameSite Cookie**: Using `Lax` mode allows cookies on cross-site top-level navigations, `Strict` would only allow same-site.
