# My Reviews Troubleshooting Guide

## Step 1: Verify Backend Build
```powershell
cd D:\Others\Source Code\ProjekSMBD\backend
go build -o api.exe ./cmd/api
```
If no errors, continue. If errors, send output.

## Step 2: Run Backend with Debug Output
```powershell
go run ./cmd/api/main.go
```

Look for this in output:
```
✅ Registered route: GET /api/reviews/user (protected)
```

## Step 3: Test Backend Directly

Open browser and go to: `http://localhost:8080/health`
Should return: `{"status": "healthy", "message": "API is running"}`

## Step 4: Get JWT Token

1. In browser DevTools (F12):
2. Go to Application/Storage tab
3. Look for cookie named `auth_token`
4. Copy the value (long string)

## Step 5: Test API Endpoint with Token

Use this HTML tester:
- File: `D:\Others\Source Code\ProjekSMBD\test-reviews-api.html`
- Open in browser
- Paste token in input
- Click "Test GET /api/reviews/user"

Expected output:
```json
{
  "success": true,
  "message": "User reviews retrieved successfully",
  "data": [
    {
      "review_id": 1,
      "title_id": "tt0111161",
      "title_name": "The Shawshank Redemption",
      "rating": 10,
      "review_text": "Amazing movie!",
      "created_at": "2025-12-22T10:00:00Z",
      "updated_at": "2025-12-22T10:00:00Z"
    }
  ]
}
```

## Step 6: Check Browser Console

While loading My Reviews:
1. F12 → Console tab
2. Look for error messages
3. Check Network tab → filter "reviews/user"
4. Check request headers (Authorization)
5. Check response status and body

## Likely Issues:

### Issue 1: "401 Unauthorized"
- Token not being sent
- Token expired
- Auth middleware rejecting

Fix: Ensure `withCredentials: true` in axios config ✓

### Issue 2: "404 Not Found"
- Route not registered
- Path mismatch

Fix: Check main.go route registration ✓

### Issue 3: "200 OK but empty data"
- SP not returning data
- userID wrong
- Reviews table empty

Fix: Test SP directly in SSMS:
```sql
EXEC dbo.sp_user_reviews @UserId = 7;
```

### Issue 4: Wrong field names in response
- Scan order wrong
- SP output order wrong

Fix: Ensure Scan() order matches SP exactly ✓

## Backend Debug Logs to Check

When you run backend, watch for:
```
[REPOSITORY] Executing GetReviewsByUser with userID: X
[REPOSITORY] Found review - ID: Y, TitleID: Z, Title: W, Rating: V
[REPOSITORY] Total reviews found: N
[HANDLER] GetUserReviews called for userID: X
[HANDLER] Got N reviews from service
```

If you don't see these, route is not being hit.

## Frontend Debug

In ReviewPanel.tsx:
- Line 27: `console.log('ReviewPanel: Fetching reviews...')`
- Line 29: `console.log('ReviewPanel: Reviews data received:', data)`

Check browser console for these logs.

## Files Modified

- `backend/internal/models/review.go` - ReviewResponse structure
- `backend/internal/repository/review_repository.go` - GetReviewsByUser()
- `backend/cmd/api/main.go` - Route registration
- `frontend/src/api/reviews.ts` - TypeScript types
- `frontend/src/components/ReviewPanel.tsx` - Component

## Next Steps

1. Run backend with `go run ./cmd/api/main.go`
2. Reload frontend
3. Open DevTools (F12)
4. Go to Profile page
5. Watch console logs
6. Check Network tab for `/reviews/user` request
7. Send me:
   - Console logs
   - Network request/response
   - Any error messages
