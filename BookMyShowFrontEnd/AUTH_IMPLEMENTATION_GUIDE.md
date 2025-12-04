# Token Authentication Implementation Guide

## Overview
The frontend now properly passes JWT tokens to all protected backend endpoints using the `x-auth-token` header, as expected by your backend authentication middleware.

## Changes Made

### 1. Updated `dynamicBaseQuery.js`
**Location:** `utils/dynamicBaseQuery.js`

**Key Changes:**
- Added `AsyncStorage` import
- Updated `prepareHeaders` to be `async`
- Retrieves token from Redux state first, then falls back to AsyncStorage
- Sets token in `x-auth-token` header (as per backend middleware)
- Added comprehensive logging with emojis for debugging

**How it works:**
```javascript
const state = getState();
let token = state.auth?.token;

// Fallback to AsyncStorage if token not in Redux
if (!token) {
  token = await AsyncStorage.getItem("token");
}

// Add token to x-auth-token header
if (token) {
  headers.set("x-auth-token", token);
}
```

**Affected APIs:**
- All APIs using `dynamicBaseQuery`:
  - `bookApi` (Booking endpoints)
  - `paymentApi` (Payment endpoints)
  - `showSeatApi` (ShowSeat endpoints)
  - `showApi` (Show endpoints)
  - `movieApi` (Movie endpoints)

### 2. Updated `authApi.js`
**Location:** `redux/api/authApi.js`

**Key Changes:**
- Changed from `Authorization: Bearer ${token}` to `x-auth-token` header
- Made `prepareHeaders` async for consistency
- Added AsyncStorage fallback
- Now uses same header format as backend middleware expects

### 3. Fixed `bookApi.js`
**Location:** `redux/api/bookApi.js`

**Fix:**
- Removed syntax error (stray 'a' character in `createPendingBooking`)

## Protected Endpoints

All these endpoints now automatically include the token:

### Booking Endpoints
- `POST /api/Booking/Booking/CreatePending` - Create pending booking
- `PUT /api/Booking/Booking/Confirm/{bookingId}` - Confirm booking after payment
- `PUT /api/Booking/Booking/Cancel/{bookingId}` - Cancel booking
- `GET /api/Booking/bookings/user/{userId}` - Get user bookings
- `GET /api/Booking/booking/{bookingId}` - Get booking details

### Payment Endpoints
- `POST /api/Payment/Payment/CreateOrder` - Create Razorpay order
- `POST /api/Payment/Payment/Verify` - Verify payment
- `POST /api/Payment/cancel` - Cancel payment

### ShowSeat Endpoints
- `POST /api/ShowSeat/ShowSeat/Create/{showId}/{screenId}` - Create show seats
- `GET /api/ShowSeat/ShowSeat/{showId}` - Get show seats
- `PUT /api/ShowSeat/ShowSeat/Block` - Block seats
- `PUT /api/ShowSeat/ShowSeat/Book` - Book seats
- `PUT /api/ShowSeat/ShowSeat/Release` - Release seats

## Token Storage

**Token Lifecycle:**

1. **Login** - User logs in via `Login.js`
   ```javascript
   const [login] = useLoginMutation();
   const response = await login(credentials);
   dispatch(setCredentials({ 
     token: response.data.token, 
     user: response.data.user 
   }));
   ```

2. **Storage** - Token stored in both Redux and AsyncStorage (via `authSlice.js`)
   ```javascript
   // authSlice.js - setCredentials reducer
   AsyncStorage.setItem("token", token);
   // Redux state.auth.token
   ```

3. **Retrieval** - `dynamicBaseQuery` retrieves token for each request
   ```javascript
   // Priority: Redux state first, then AsyncStorage
   ```

4. **Logout** - Token cleared from both locations
   ```javascript
   dispatch(clearCredentials());
   // Clears Redux state and AsyncStorage
   ```

## Debugging

The implementation includes comprehensive logging:

**Console Output Examples:**

```
✅ Token added to x-auth-token header
🔍 Unified search for query: Bahubali City: 65f4d8c2a1b9e0f5c2d3e4f5
📡 Fetching from URL: http://10.90.13.242:3000/api/Shows/unified-search?q=Bahubali&city=65f4d8c2a1b9e0f5c2d3e4f5
📡 Response status: 200
✅ Response received: {"status":200,"movies":[...],"theatres":[...]}
📊 Total results - Movies: 5, Theatres: 3
```

**If token is missing:**
```
Token from AsyncStorage: ❌ Not found
⚠️ No token available for request
```

## API Requests Lifecycle

**Example: Book Seats**

1. Component calls mutation:
   ```javascript
   const [blockSeats] = useBlockSeatsMutation();
   await blockSeats({ showSeatIds, showId });
   ```

2. `dynamicBaseQuery` automatically:
   - Retrieves token from Redux or AsyncStorage
   - Adds token to `x-auth-token` header
   - Sets `Content-Type: application/json`
   - Makes request to backend

3. Backend middleware (`AuthMiddleware`) verifies:
   ```javascript
   const token = req.header("x-auth-token");
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   req.user = decoded; // Now available in controller
   ```

4. Controller executes and returns response

## Important Notes

✅ **Token is now passed on EVERY request** - No more 401 errors

✅ **Dual storage** - Token in Redux for performance, AsyncStorage for persistence across app restarts

✅ **Automatic fallback** - If Redux token missing, AsyncStorage is checked

✅ **Consistent header format** - All endpoints use `x-auth-token` header as expected by backend

⚠️ **AsyncStorage operations are async** - `prepareHeaders` is now async to handle this

## Common Issues & Solutions

**Issue:** "Access denied. No token provided." (401 error)
- **Check:** Is user logged in? (token in Redux/AsyncStorage?)
- **Check:** Is `dynamicBaseQuery` being used? (all protected endpoints use it)
- **Check:** Backend receiving `x-auth-token` header?

**Issue:** "Invalid token" (400 error)
- **Check:** Is JWT_SECRET same in backend and token creation?
- **Check:** Has token expired? (TokenExpiredError)
- **Solution:** User needs to login again

**Issue:** Token not persisting after app restart
- **Check:** AsyncStorage is working? (`AsyncStorage.getItem("token")`)
- **Check:** Token being set in AsyncStorage during login? (`AsyncStorage.setItem("token", token)`)

## Testing Authentication

**Manual Test:**
1. Open app and check Redux DevTools
2. Navigate to Login screen
3. Enter credentials and submit
4. Check Redux state for `auth.token`
5. Navigate to protected screen (e.g., Orders)
6. Check Network tab - should see `x-auth-token` header in requests
7. Check backend logs - should see decoded user data in `req.user`

**Check Token in Console:**
```javascript
// In any component
const token = useSelector(state => state.auth?.token);
console.log("Current token:", token);
```
