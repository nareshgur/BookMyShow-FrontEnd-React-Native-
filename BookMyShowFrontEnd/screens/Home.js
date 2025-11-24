import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSelector } from "react-redux";
import { useGetMoviesByCityQuery } from "../redux/api/movieApi";
useGetMoviesByCityQuery;
export default function HomeScreen({ navigation }) {
  // Get selected city from Redux store
  const selectedCity = useSelector((state) => state.city.selectedCity);

  // Fetch movies from backend
  const {
    data: movies,
    isLoading,
    isFetching,
    error,
  } = useGetMoviesByCityQuery(selectedCity, {
    skip: !selectedCity, // avoid API call if city not selected
  });

  console.log("The movies we received from the backend ", movies);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>It All Starts Here!</Text>

          <TouchableOpacity onPress={() => navigation.navigate("SelectCity")}>
            <Text style={styles.cityText}>
              {selectedCity || "Select City"} ▾
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {[
            "Movies",
            "HSBC Lounge",
            "Music Shows",
            "Stream",
            "Comedy",
            "Sports",
          ].map((item) => (
            <View key={item} style={styles.categoryItem}>
              <View style={styles.categoryIcon} />
              <Text style={styles.categoryText}>{item}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Banner */}
        <View style={styles.bannerWrapper}>
          <Image
            source={{ uri: "https://via.placeholder.com/400x200" }}
            style={styles.bannerImage}
          />
        </View>

        {/* Recommended Movies Section */}
        <View style={styles.recommendHeader}>
          <Text style={styles.recommendTitle}>Recommended Movies</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All ›</Text>
          </TouchableOpacity>
        </View>

        {/* === Loading State === */}
        {(isLoading || isFetching) && (
          <ActivityIndicator
            size="large"
            color="red"
            style={{ marginTop: 20 }}
          />
        )}

        {/* === Error State === */}
        {error && (
          <Text style={{ color: "red", marginLeft: 16, marginTop: 10 }}>
            Failed to load movies
          </Text>
        )}

        {/* === Movie List === */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.recommendList}
        >
          {movies?.map((movie) => (
            <TouchableOpacity
              key={movie.movieId}
              style={styles.movieCard}
              onPress={() => navigation.navigate("MovieDetails", { movie })}
            >
              <Image
                source={{
                  uri:
                    movie.moviePoster || "https://via.placeholder.com/120x180",
                }}
                style={styles.movieImage}
              />
              <Text style={styles.movieTitle} numberOfLines={1}>
                {movie.movieName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  cityText: {
    color: "red",
    fontWeight: "600",
    marginTop: 4,
  },
  categoriesContainer: {
    marginTop: 10,
    paddingHorizontal: 12,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#ddd",
    borderRadius: 24,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
  },
  bannerWrapper: {
    marginTop: 16,
    paddingHorizontal: 12,
  },
  bannerImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  recommendHeader: {
    marginTop: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recommendTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAll: {
    color: "red",
    fontSize: 14,
  },
  recommendList: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  movieCard: {
    marginRight: 14,
  },
  movieImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
  },
  movieTitle: {
    marginTop: 6,
    width: 120,
    fontSize: 13,
  },
});
