import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../redux/api/authApi";
import { setCredentials } from "../redux/slices/authSlice";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  // RTK Query mutation
  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace("MainApp");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter email and password");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email");
      return;
    }

    try {
      // Call login mutation with credentials
      const result = await login({
        email,
        Password: password, // backend expects capital P
      }).unwrap();

      console.log("Login successful:", result);

      // Extract token and user from response
      const { token, user } = result.data || result;

      if (token) {
        // Dispatch credentials to Redux auth state
        dispatch(
          setCredentials({
            token,
            user: user || { email },
          })
        );

        Alert.alert("Success", `Welcome back, ${user?.name || email}!`);
        // Navigation will happen automatically via isAuthenticated watcher
      } else {
        Alert.alert("Error", "No token received from server");
      }
    } catch (error) {
      console.log("Login error:", error);
      const errorMessage = error?.data || error?.message || "Login failed";
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Text style={styles.eyeText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordBtn}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && { opacity: 0.6 },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Login (placeholder) */}
          {/* <View style={styles.socialSection}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>
        </View> */}
        </View>

        {/* Footer - Register Link */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate("Register")}
            >
              Register here
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  headerSection: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  formSection: {
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  eyeIcon: {
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
  },
  forgotPasswordBtn: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#ff2e63",
    fontSize: 13,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#ff2e63",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    paddingHorizontal: 10,
    color: "#999",
    fontSize: 12,
  },
  socialSection: {
    gap: 10,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  socialButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  footerSection: {
    paddingBottom: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#666",
  },
  registerLink: {
    color: "#ff2e63",
    fontWeight: "700",
  },
});

//   const { show, movie } = route.params;
//   const dispatch = useDispatch();

//   const selectedSeats = useSelector((state) => state.showSeat.selectedSeats);
//   const user = useSelector((state) => state.auth.user);
//   const userId = user?._id;

//   // Fetch seats
//   const { data: seatsData, isLoading, refetch } = useGetShowSeatsByShowQuery(
//     show?._id,
//     { skip: !show?._id }
//   );

//   const [createPendingBooking] = useCreatePendingBookingMutation();
//   const [createRazorpayOrder] = useCreateRazorpayOrderMutation();

//   const seatPrice = 150;
//   const totalPrice = selectedSeats.length * seatPrice;

//   // Load seats into Redux
//   useEffect(() => {
//     if (seatsData) {
//       dispatch(setSeats(seatsData));
//     }
//   }, [seatsData]);

//   // ⭐ ADDED: Refresh seats + clear selected seats when screen is focused
//   useFocusEffect(
//     React.useCallback(() => {
//       console.log("🔄 Screen focused → refreshing seats");
//       refetch();                 // fetch latest seat status
//       dispatch(clearSelectedSeats());   // reset seat selection
//       return () => {};
//     }, [])
//   );

//   // Clear seats if component unmounts
//   useEffect(() => {
//     return () => {
//       dispatch(clearSelectedSeats());
//     };
//   }, []);

//   const handleSeatPress = (seat) => {
//     if (["BOOKED", "BLOCKED", "SOLD"].includes(seat.status)) return;
//     dispatch(toggleSelectedSeat(seat._id));
//   };

//   const handleBookSeats = async () => {
//     if (!userId) {
//       return Alert.alert("Not Logged In", "Please login to continue.");
//     }
//     if (selectedSeats.length === 0) {
//       return Alert.alert("Select Seats", "Choose at least one seat.");
//     }

//     try {
//       // 1️⃣ Create pending booking
//       const bookingRes = await createPendingBooking({
//         userId,
//         showId: show._id,
//         showSeatIds: selectedSeats,
//       }).unwrap();

//       const bookingId = bookingRes.data._id;
//       dispatch(setCurrentBooking(bookingRes.data));

//       // 2️⃣ Create Razorpay order
//       const orderRes = await createRazorpayOrder({ bookingId }).unwrap();
//       const { order, paymentId } = orderRes;

//       // 3️⃣ Navigate to Razorpay checkout
//       navigation.navigate("RazorpayCheckoutScreen", {
//         orderId: order.id,
//         amount: order.amount,
//         user,
//         paymentId,
//         bookingId,
//       });
//     } catch (err) {
//       console.log("Booking error:", err);
//       Alert.alert("Error", err.message);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>‹</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{movie.movieName}</Text>
//         <Text>{selectedSeats.length} Seat(s)</Text>
//       </View>

//       {isLoading ? (
//         <ActivityIndicator size="large" />
//       ) : (
//         <ScrollView style={styles.seatsContainer}>
//           <View style={styles.seatsGrid}>
//             {seatsData?.map((seat) => (
//               <TouchableOpacity
//                 key={seat._id}
//                 style={[
//                   styles.seat,
//                   {
//                     backgroundColor: selectedSeats.includes(seat._id)
//                       ? "green"
//                       : seat.status === "BOOKED"
//                       ? "#ccc"
//                       : "#fff",
//                   },
//                 ]}
//                 onPress={() => handleSeatPress(seat)}
//               >
//                 <Text>{seat.seatNumber}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </ScrollView>
//       )}

//       <View style={styles.bottomBar}>
//         <Text style={styles.totalPrice}>₹ {totalPrice}</Text>
//         <TouchableOpacity
//           style={styles.payButton}
//           onPress={handleBookSeats}
//           disabled={selectedSeats.length === 0}
//         >
//           <Text style={styles.payButtonText}>Pay ₹ {totalPrice}</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "flex-start",
//   },
//   inputContainer: {
//     flex: 1,
//     gap: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "black",
//     borderRadius: 8,
//     padding: 10,
//     width: 300,
//   },
//   button: {
//     height: 50,
//     width: 100,
//     backgroundColor: "#ff0a54",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 10,
//   },
//    registerText: {
//     marginTop: 15,
//     textAlign: "center",
//     color: "#444",
//   },
// });
