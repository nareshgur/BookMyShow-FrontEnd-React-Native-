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
  
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  // RTK Query mutation
  const [login, { isLoading }] = useLoginMutation();

  // Validation patterns
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,6}$/;
  const PASSWORD_MIN_LEN = 8;

  // Redirect if already authenticated
  useEffect(() => {
    async function checkAuthAndRedirect() {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");
      if (token && user) {
        navigation.replace("MainApp");
      }
    }
    checkAuthAndRedirect();
  }, [isAuthenticated]);

  // Real-time validation function
  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "email":
        if (!value) error = "Email is required";
        else if (!EMAIL_REGEX.test(value)) error = "Invalid email format (use: name@domain.com)";
        break;

      case "password":
        if (!value) error = "Password is required";
        else if (value.length < PASSWORD_MIN_LEN) error = `Password must be at least ${PASSWORD_MIN_LEN} characters`;
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error === "";
  };

  const handleFieldChange = (fieldName, value) => {
    if (fieldName === "email") {
      setEmail(value);
    } else if (fieldName === "password") {
      setPassword(value);
    }
    // Validate on change
    validateField(fieldName, value);
  };

  const validateAll = () => {
    const emailValid = validateField("email", email);
    const passwordValid = validateField("password", password);
    return emailValid && passwordValid;
  };

  const handleLogin = async () => {
    if (!validateAll()) {
      Alert.alert("Validation Error", "Please fix all errors before logging in");
      return;
    }

    try {
      const result = await login({
        email,
        Password: password,
      }).unwrap();

      // result structure now: { status, message, data: { token, user } }
      const status = result.status ?? 200;
      if (status >= 400) {
        const msg = result.message || "Login failed";
        Alert.alert("Login Failed", msg);
        return;
      }

      const { token, user } = result.data || {};

      if (token) {
        dispatch(setCredentials({ token, user: user || { email } }));
        Alert.alert("Success", `Welcome back, ${user?.name || email}!`);
      } else {
        Alert.alert("Error", "No token received from server");
      }
    } catch (err) {
      console.log("Login error:", err);
      // RTK Query error shape: err.data or err.error
      const serverMessage = err?.data?.message || err?.data || err?.message || "Login failed";
      Alert.alert("Login Failed", serverMessage);
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
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                value={email}
                onChangeText={(value) => handleFieldChange("email", value)}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  value={password}
                  onChangeText={(value) => handleFieldChange("password", value)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Text style={styles.eyeText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
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
  inputError: {
    borderColor: "#ff2e63",
    borderWidth: 2,
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
  errorText: {
    color: "#ff2e63",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
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

