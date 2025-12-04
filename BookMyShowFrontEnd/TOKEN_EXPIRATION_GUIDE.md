# Token Expiration Handling Implementation

## Overview
Implemented comprehensive token expiration detection and handling in BookingScreen to automatically redirect users to the Login screen when their session expires.

## Changes Made

### 1. **BookingScreen.js** - Main Implementation

#### Added Imports:
```javascript
import { clearCredentials } from "../redux/slices/authSlice";
```

#### Added Helper Functions:

**`isTokenExpired(errorMessage)`**
- Checks if error message contains "token expired" (case-insensitive)
- Returns `true` if token has expired
- Handles different error message formats (string, object, etc.)

**`handleTokenExpiration(dispatch, navigation)`**
- Clears user credentials from Redux
- Removes token and user from AsyncStorage
- Navigates to Login screen using `navigation.reset()`
- Ensures complete logout before redirect

#### Token Expiration Detection Points:

**1. Query Error Handler (lines 65-83)**
```javascript
useEffect(() => {
  if (isError && error) {
    const errorMessage = error?.data?.message || error?.message || '';
    
    if (isTokenExpired(errorMessage)) {
      Alert.alert("Session Expired", "Your session has expired. Please login again.", [
        {
          text: "OK",
          onPress: () => handleTokenExpiration(dispatch, navigation)
        }
      ]);
    }
  }
}, [isError, error]);
```

**2. Booking Operation Error Handler (lines 150-182)**
```javascript
catch (err) {
  const errorMessage = err?.data?.message || err?.message || err.toString();
  
  if (isTokenExpired(errorMessage)) {
    Alert.alert("Session Expired", "Your session has expired. Please login again.", [
      {
        text: "OK",
        onPress: () => handleTokenExpiration(dispatch, navigation)
      }
    ]);
  } else {
    Alert.alert("Booking Error", errorMessage || "An error occurred...");
  }
}
```

### 2. **showSeatApi.js** - API Error Handling

#### Added Error Handler Middleware:
```javascript
const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await dynamicBaseQuery(args, api, extraOptions);
  
  if (result.error) {
    const errorMessage = result.error?.data?.message || result.error?.message || '';
    if (errorMessage.toLowerCase().includes("token expired")) {
      console.error("❌ Token expired - API error detected");
    }
  }
  
  return result;
};
```

- Wraps `dynamicBaseQuery` to intercept errors
- Logs token expiration errors for debugging
- Used by all showSeatApi endpoints

#### Applied to All Endpoints:
- `getShowSeatsByShow` - Seat query detection
- `blockSeats` - Booking operation detection
- `createShowSeats`, `bookSeats`, `releaseSeats` - Other operations

## User Experience Flow

### When Token Expires:

1. **API returns "Token expired" error**
   ↓
2. **Frontend detects error message** (via `isTokenExpired()`)
   ↓
3. **Alert shown to user**: "Session Expired - Your session has expired. Please login again."
   ↓
4. **User clicks OK**
   ↓
5. **Credentials cleared** from Redux + AsyncStorage
   ↓
6. **Automatically redirected** to Login screen
   ↓
7. **User must login again** to access the app

## Error Message Detection

The system detects token expiration by checking if error message contains:
- "token expired" (case-insensitive)
- Works with both backend responses:
  - `{ status: 401, message: "Token expired. Please login again." }`
  - `{ message: "TokenExpiredError" }`

## Benefits

✅ **Seamless Session Management** - Automatic detection and handling
✅ **User-Friendly** - Clear alert before redirect
✅ **Complete Cleanup** - Redux + AsyncStorage cleared
✅ **Debugging Support** - Console logs with emojis (❌ Token expired)
✅ **Multiple Detection Points** - Catches errors in query and mutation operations
✅ **Graceful Degradation** - Non-token errors still show appropriate messages

## Testing

**Manual Test Scenario:**

1. Login to the app
2. On backend, delete/invalidate the user's token
3. Try to book seats in BookingScreen
4. Expected: Alert "Session Expired" appears → Redirect to Login

**Debug Console Output:**
```
Query error: {data: {message: "Token expired. Please login again."}}
❌ Token expired detected in query
Token from AsyncStorage: ❌ Not found
⚠️ No token available for request
❌ Token expired - API error detected
```

## Affected Flows

✅ Getting seats for a show
✅ Blocking seats
✅ Creating pending booking
✅ Creating Razorpay order
✅ Confirming booking after payment
✅ Any other protected operation

## API Endpoints Protected

All endpoints using `dynamicBaseQuery` now have token expiration detection:
- `GET /api/ShowSeat/ShowSeat/{showId}`
- `PUT /api/ShowSeat/ShowSeat/Block`
- `POST /api/Booking/Booking/CreatePending`
- `PUT /api/Payment/Payment/CreateOrder`
- And all other protected endpoints

## Future Enhancements

- Add automatic token refresh before expiration
- Show countdown timer before session expires
- Implement token refresh tokens for seamless re-authentication
- Add logout confirmation alert before clearing session
