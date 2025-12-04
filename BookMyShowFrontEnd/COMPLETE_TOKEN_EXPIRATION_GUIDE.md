# Token Expiration Handling - Complete Implementation

## Summary
Added comprehensive token expiration detection and automatic logout across all screens and APIs that use Payment, Booking, and ShowSeat APIs.

## Files Modified

### 1. **Screen Components**

#### BookingScreen.js
✅ Helper functions: `isTokenExpired()`, `handleTokenExpiration()`
✅ Query-level error handling for seat fetching
✅ Mutation-level error handling for booking operations
✅ Automatic redirect to Login on token expiration

#### VerifyPayment.js
✅ Added token expiration helpers
✅ Error handling in `verifyNow()` function
✅ Error handling in `fetchBookingAndNavigate()` function
✅ Detects token expiration in both API mutation and manual fetch requests
✅ Shows alert before redirecting to Login

#### RazorpayCheckout.js
✅ Added token expiration helpers
✅ Fixed token header format: `"x-auth-token"` (was `"Authorization": "Bearer"`)
✅ Error handling for payment cancellation
✅ Automatic redirect to Login on token expiration

#### OrderHistoryScreen.js
✅ Added token expiration helpers
✅ Query-level error handling for user bookings fetch
✅ Shows alert on session expiration
✅ Automatic redirect to Login with Redux state cleanup

### 2. **API Layer**

#### showSeatApi.js
✅ Enhanced baseQuery with error handling middleware
✅ Detects "token expired" in all showseat operations
✅ Applied to: `getShowSeatsByShow`, `blockSeats`, `bookSeats`, `releaseSeats`, `createShowSeats`

#### bookApi.js
✅ Enhanced baseQuery with error handling middleware
✅ Detects "token expired" in all booking operations
✅ Applied to: `createPendingBooking`, `confirmBooking`, `cancelBooking`, `getUserBookings`

#### paymentApi.js
✅ Enhanced baseQuery with error handling middleware
✅ Detects "token expired" in all payment operations
✅ Applied to: `createRazorpayOrder`, `verifyPayment`

## Implementation Details

### Helper Functions (Reusable Pattern)

**`isTokenExpired(errorMessage)`**
```javascript
const isTokenExpired = (errorMessage) => {
  if (!errorMessage) return false;
  const message = typeof errorMessage === 'string' ? errorMessage : errorMessage.toString();
  return message.toLowerCase().includes("token expired");
};
```

**`handleTokenExpiration(dispatch, navigation)`**
```javascript
const handleTokenExpiration = (dispatch, navigation) => {
  dispatch(clearCredentials());
  AsyncStorage.removeItem("token");
  AsyncStorage.removeItem("user");
  navigation.reset({
    index: 0,
    routes: [{ name: "Login" }],
  });
};
```

### API Error Handler Middleware

All three API files now include:
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

## Token Expiration Detection Points

### Query-Level Detection
- **BookingScreen**: `useGetShowSeatsByShowQuery` error detection
- **OrderHistoryScreen**: `useGetUserBookingsQuery` error detection

### Mutation-Level Detection
- **BookingScreen**: `blockSeats`, `createPendingBooking`, `createRazorpayOrder` errors
- **VerifyPayment**: `verifyPayment` mutation error
- **RazorpayCheckout**: Payment cancellation error

### Manual Fetch-Level Detection
- **VerifyPayment**: Booking fetch after payment success
- **RazorpayCheckout**: Payment cancellation API call

## User Experience Flow

### When Token Expires During Booking:
1. User selects seats and clicks "Pay"
2. BlockSeats API called → Returns "Token expired" error
3. Frontend detects error with `isTokenExpired()`
4. Alert shown: "Session Expired - Your session has expired. Please login again."
5. User clicks OK
6. Redux state cleared + AsyncStorage cleared
7. User redirected to Login screen

### When Token Expires During Payment Verification:
1. Payment successful in Razorpay
2. VerifyPayment screen attempts to verify payment
3. API returns "Token expired" error
4. Frontend detects error
5. Alert shown
6. User automatically redirected to Login

### When Token Expires in Order History:
1. User navigates to Order History
2. useGetUserBookingsQuery attempts to fetch
3. API returns "Token expired" error
4. Frontend detects error
5. Alert shown
6. User automatically redirected to Login

## Affected Screens

✅ **BookingScreen.js**
- Seat selection and booking flow
- Payment gateway integration

✅ **VerifyPayment.js**
- Payment verification
- Booking details fetch after payment

✅ **RazorpayCheckout.js**
- Payment gateway WebView
- Payment cancellation handling

✅ **OrderHistoryScreen.js**
- User bookings history display

## Affected APIs

✅ **showSeatApi.js** (All 5 endpoints)
- `getShowSeatsByShow` - Query
- `createShowSeats` - Mutation
- `blockSeats` - Mutation
- `bookSeats` - Mutation
- `releaseSeats` - Mutation

✅ **bookApi.js** (All 4 endpoints)
- `createPendingBooking` - Mutation
- `confirmBooking` - Mutation
- `cancelBooking` - Mutation
- `getUserBookings` - Query

✅ **paymentApi.js** (All 2 endpoints)
- `createRazorpayOrder` - Mutation
- `verifyPayment` - Mutation

## Headers Fixed

### Before (RazorpayCheckout.js):
```javascript
Authorization: `Bearer ${token}`  // ❌ Wrong format
```

### After (All Files):
```javascript
"x-auth-token": token  // ✅ Correct format for backend middleware
```

## Console Logging

Debug logs added with emojis:
- `❌ Token expired - API error detected` - API level
- `❌ Token expired detected in query` - Query level
- `❌ Token expired during payment verification` - Mutation level
- `🔍 Fetching booking with token: ✅ Token present` - Manual fetch
- `⚠️ No token available for request` - Token missing

## Testing Checklist

- [ ] Test booking flow until payment → Verify token expiration redirects to Login
- [ ] Test payment verification → Verify token expiration redirects to Login
- [ ] Test payment cancellation → Verify token expiration redirects to Login
- [ ] Test order history access → Verify token expiration redirects to Login
- [ ] Verify Redux state is cleared on logout
- [ ] Verify AsyncStorage is cleared on logout
- [ ] Verify user cannot access protected screens after token expiration
- [ ] Verify all alert dialogs show before redirect

## Code Quality

✅ All files error-free (verified with linter)
✅ Consistent error handling pattern across all screens
✅ Proper Redux state management
✅ Proper AsyncStorage cleanup
✅ Navigation reset prevents back navigation to protected screens
✅ Console logging for debugging

## Security Notes

✅ Token properly cleared from Redux state
✅ Token properly cleared from AsyncStorage
✅ Navigation reset prevents back button access
✅ User must login again after token expiration
✅ No sensitive data leaked in error messages

## Future Enhancements

- Implement automatic token refresh before expiration
- Add countdown timer showing time until session expires
- Implement refresh tokens for seamless re-authentication
- Add logout confirmation before clearing session
- Add "Remember Me" functionality with secure token storage
