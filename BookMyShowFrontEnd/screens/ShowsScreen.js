import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useGetShowsByMovieQuery } from "../redux/api/showApi";

const BASE_API = "http://10.90.13.242:3000/api"; // same base as dynamicBaseQuery

export default function ShowsScreen({ route, navigation }) {
  const { movieId, movie } = route.params || {};

  const {
    data: showsData,
    isLoading,
    isError,
  } = useGetShowsByMovieQuery(movieId, {
    skip: !movieId,
  });

  const [theatreNames, setTheatreNames] = useState({});

  console.log("The shows we fetched from the showsByMovieId", showsData);

  // group shows by theatreId
  const showsByTheatre = useMemo(() => {
    if (!Array.isArray(showsData)) return {};
    return showsData.reduce((acc, s) => {
      const tid = s.theatreId ? String(s.theatreId) : "unknown";
      if (!acc[tid]) acc[tid] = [];
      acc[tid].push(s);
      return acc;
    }, {});
  }, [showsData]);

  useEffect(() => {
    console.log("Shows by theatre ", showsByTheatre);
    // fetch names for theatres we found
    const tids = Object.keys(showsByTheatre || {});
    if (tids.length === 0) return;

    console.log("Fetching theatre names for IDs ", tids);
    tids.forEach(async (tid) => {
      if (theatreNames[tid]) return; // already fetched
      try {
        console.log("The statement before the Theatres API for names");

        const res = await fetch(`${BASE_API}/Theatre/Theatres/id/${tid}`);
        console.log("The output of the theatre API is", res);
        if (!res.ok) throw new Error("no theatre");
        const json = await res.json();
        // common fields could be `name` or `theatreName`
        const name = json.name || json.theatreName || json.theatre || tid;
        setTheatreNames((t) => ({ ...t, [tid]: name }));
      } catch (e) {
        setTheatreNames((t) => ({ ...t, [tid]: tid }));
      }
    });
  }, [showsByTheatre]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff2e63" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#333" }}>Failed to load shows.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {movie?.movieName || "Showtimes"}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        {Object.keys(showsByTheatre).length === 0 && (
          <View style={styles.emptyRow}>
            <Text style={{ color: "#666" }}>
              No shows available for this movie.
            </Text>
          </View>
        )}

        {Object.entries(showsByTheatre).map(([tid, shows]) => (
          <View key={tid} style={styles.theatreCard}>
            <View style={styles.theatreHeader}>
              <Text style={styles.theatreName}>{theatreNames[tid] || tid}</Text>
              <TouchableOpacity style={styles.infoBtn} onPress={() => {}}>
                <Text style={styles.infoText}>i</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.theatreMeta}>Non-cancellable</Text>

            <View style={styles.timesRow}>
              {shows.map((s) => (
                <TouchableOpacity
                  key={s._id || s.id || s.startTime}
                  style={styles.timePill}
                  onPress={() => {
                    // navigate to booking screen or pass show to booking
                    navigation.navigate("Booking", { show: s, movie , startTime: s.startTime});
                  }}
                >
                  {console.log("The show time being rendered is ", s.startTime)}
                  <Text style={styles.timeText}>
                    {s.startTime || s.time || "—"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 34, color: "#111" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  scroll: { paddingHorizontal: 12 },
  emptyRow: { padding: 20, alignItems: "center" },
  theatreCard: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderColor: "#eee",
    borderWidth: 1,
  },
  theatreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  theatreName: { fontSize: 16, fontWeight: "700" },
  infoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  infoText: { fontSize: 12, color: "#666" },
  theatreMeta: { marginTop: 8, color: "#666", fontSize: 12 },
  timesRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  timePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dfeee6",
    marginRight: 8,
    marginBottom: 8,
  },
  timeText: { color: "#1b7a5b", fontWeight: "700" },
});
