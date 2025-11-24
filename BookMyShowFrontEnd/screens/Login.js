import React, { useState } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputBase,
  View,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useLoginMutation } from "../redux/api/authApi";
function Login() {
  const navigate = useNavigation();
  const [email, setMail] = useState("");
  const [Password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  async function LoginOpe() {
    console.log("LoginOpe called");

    try {
      // const res = await axios.post("http://192.168.1.8:3000/api/Auth/login", {
      //   email: email,
      //   Password: password
      // });

      const res = await login({ email, Password }).unwrap();
      console.log("The result of backend login ", res.data);
      // const {data,token} = res.data.data

      // console.log("The data is",res.data.data," The token is ",res.data.data.token);
      AsyncStorage.setItem("token", res.data.token);
      AsyncStorage.setItem("user", JSON.stringify(res.data.user));

      navigate.navigate("SelectCity");
      // console.log("The user details from Async Storage",await AsyncStorage.getItem("user"));
      // console.log("The token details from Async Storage",await AsyncStorage.getItem("token"));
    } catch (err) {
      console.log("Login error: ", err);
      console.log("Something went wrong ", err);
    }
  }

  return (
    <View style={styles.container}>
      <Text>Login Screen</Text>
      <View style={styles.inputContainer}>
        <View>
          <Text>Email : </Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(text) => setMail(text)}
            placeholder="Enter Email"
          />
        </View>
        <View>
          <Text>Password : </Text>
          <TextInput
            style={styles.input}
            value={Password}
            onChangeText={(text) => setPassword(text)}
            placeholder="Enter Password"
          />
        </View>
        <Pressable
          style={styles.button}
          onPress={() => {
            console.log("Button is clicked ");
            LoginOpe();
          }}
          placeholder="Login"
        >
          <Text>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  inputContainer: {
    flex: 1,
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    padding: 10,
    width: 300,
  },
  button: {
    height: 50,
    width: 100,
    backgroundColor: "#ff0a54",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
});
