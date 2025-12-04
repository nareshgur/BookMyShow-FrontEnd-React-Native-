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
  const [results, setResults] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem("selectedCityId").then((id) => {
      console.log("The selected City Id is ", id);
      setCityId(id);
    });
  }, []);

  const fetchTheatres = async (cityIdToUse, q) => {
    if (!q || q.trim().length === 0) {
      console.log("Search query is empty, skipping search");
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      console.log("🔍 Unified search for query:", q, "City:", cityIdToUse);
      const url = `${API_BASE}/Shows/unified-search?q=${encodeURIComponent(q)}&city=${encodeURIComponent(cityIdToUse)}`;
      console.log("📡 Fetching from URL:", url);
      
      const res = await fetch(url);
      console.log("📡 Response status:", res.status);

      console.log("Response object:", res);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ HTTP Error:", res.status, errorText);
        setResults([]);
        return;
      }
      
      const json = await res.json();
      console.log("✅ Response received:", JSON.stringify(json));
      
      // Organize results by type
      const movies = json.movies || [];
      const theatres = json.theatres || [];
      
      // Create a combined results array with type indicators
      const combined = [
        ...movies.map((m) => ({
          _id: m._id,
          type: "movie",
          name: m.movieName,
          subtitle: m.movieLanguage || "Movie",
          genres: m.movieGenres,
          theatreName: m.theatreId?.name || "Unknown Theatre",
          // Include full movie object for MovieDetails screen
          fullMovie: {
            _id: m._id,
            movieId: m.movieId,
            movieName: m.movieName,
            moviePoster: m.moviePoster,
            movieLanguage: m.movieLanguage,
            movieGenres: m.movieGenres,
            duration: m.duration,
            censor: m.censor,
            releaseDate: m.releaseDate,
            description: m.description,
            adBanner: m.adBanner,
            theatreId: m.theatreId,
            ...m // Include all other properties from the API response
          }
        })),
        ...theatres.map((t) => ({
          _id: t._id,
          type: "theatre",
          name: t.name,
          subtitle: t.address || "Theatre",
          cityId: t.cityId
        }))
      ];
      
      console.log(`📊 Total results - Movies: ${movies.length}, Theatres: ${theatres.length}`);
      setResults(combined);
    } catch (err) {
      console.error("❌ fetchTheatres error", err);
      setResults([]);
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
      <Text style={styles.header}>Search</Text>

        </View>

      <TextInput
        placeholder="Search movie name or theatre..."
        value={query}
        onChangeText={onSearch}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item._id}`}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, item.type === "movie" && styles.movieCard]}
              onPress={() => {
                if (item.type === "movie") {
                  console.log("Navigating to MovieDetails for movie:", item.fullMovie);
                  navigation.navigate("MovieDetails", { movie: item.fullMovie });
                } else {
                  navigation.navigate("TheatreDetails", { theatreId: item._id });
                }
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.badge}>{item.type === "movie" ? "🎬 Movie" : "🏢 Theatre"}</Text>
              </View>
              <Text style={styles.addr}>{item.subtitle}</Text>
              {item.type === "movie" && item.theatreName && (
                <Text style={styles.theatreInfo}>@ {item.theatreName}</Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ padding: 12, textAlign: "center", color: "#999" }}>No results found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 35 },
  backBtn: {
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    flexDirection: "row",
  },
  header: { fontSize: 20, fontWeight: "700", margin: 12 },
  input: {
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },
  card: {
    backgroundColor: "#fafafa",
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff6b6b",
  },
  movieCard: {
    borderLeftColor: "#4ecdc4",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "700", flex: 1 },
  badge: {
    fontSize: 12,
    marginLeft: 8,
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addr: { marginTop: 4, color: "#666", fontSize: 13 },
  theatreInfo: { marginTop: 4, color: "#4ecdc4", fontSize: 12, fontWeight: "600" },
});
