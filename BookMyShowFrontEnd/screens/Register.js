import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";

const API_BASE = "http://10.90.13.242:3000/api";  // your backend

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {

    // Basic validation
    if (!name || !email || !phone || !password) {
      Alert.alert("Missing Fields", "Please fill all the fields");
      return;
    }
  
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          Password: password, // backend expects capital P
        }),
      });

      const data = await response.json();

      console.log("Register response:", data);

      if (response.status === 200) {
        Alert.alert("Success", "Account created successfully");

        // Redirect to Login
        navigation.replace("Login");
      } else {
        Alert.alert("Error", data);
        console.log("Registration failed:", data);
      }

    } catch (error) {
      Alert.alert("Error", "Something went wrong");
      console.log("Register error:", error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Create Your Account</Text>

      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>

    </View>
  );
}


// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  header: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },

  button: {
    backgroundColor: "#ff2e55",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  loginText: {
    marginTop: 15,
    textAlign: "center",
    color: "#444",
  },
});
