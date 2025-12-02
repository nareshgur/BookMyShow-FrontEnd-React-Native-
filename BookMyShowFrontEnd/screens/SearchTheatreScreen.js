// screens/SearchTheatreScreen.js
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";


const API_BASE = "http://10.90.13.242:3000/api"; // change to your base

export default function SearchTheatreScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [cityId, setCityId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theatres, setTheatres] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem("selectedCityId").then((id) => {
        console.log("The selected City Id is ", id);
        const selectedCityId = id;
      setCityId(id);
      if (id) fetchTheatres(id, "");
    });
  }, []);

  const fetchTheatres = async (cityIdToUse, q) => {
    setLoading(true);
    try {
        console.log("Fetching theatres for cityId:", cityIdToUse, "with query:", q);
      const url = `${API_BASE}/Theatre/search?cityId=${cityIdToUse}&query=${encodeURIComponent(q || "")}`;
      const res = await fetch(url);
      console.log("The response from theatre search ", res);
      const json = await res.json();
      if (json?.status === 200) setTheatres(json.data || []);
      else setTheatres([]);
    } catch (err) {
      console.error("fetchTheatres error", err);
      setTheatres([]);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (text) => {
    console.log("The search text received is ", text)
    setQuery(text);
    if (!cityId) return;
    // Debounce if you want — for now simple call:
    fetchTheatres(cityId, text);
  };

  return (
    <View style={styles.container}>
        <View style={styles.backBtn}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black"  />
            </TouchableOpacity>
      <Text style={styles.header}>Search Theatres</Text>

        </View>

      <TextInput
        placeholder="Search theatre name or address..."
        value={query}
        onChangeText={onSearch}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={theatres}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("TheatreDetails", { theatreId: item._id })}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.addr}>{item.address}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ padding: 12 }}>No theatres found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" ,
    paddingTop:35
  },
  backBtn:{
    justifyContent:"flex-start",
    alignItems:"center",
    padding:20,
    flexDirection:"row",
  },
  header: { fontSize: 20, fontWeight: "700", margin: 12 },
  input: {
    marginHorizontal: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10
  },
  card: { backgroundColor: "#fafafa", padding: 12, marginVertical: 8, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: "700" },
  addr: { marginTop: 4, color: "#666" },
});
