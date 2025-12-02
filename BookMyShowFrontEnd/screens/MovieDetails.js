import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";

export default function MovieDetailsScreen({ route, navigation }) {
  const { movie } = route.params;


  console.log("MovieDetailsScreen - route.params:", route.params);  console.log("MovieDetailsScreen - movie:", movie);
  const selectedCity = useSelector((state) => state.city?.selectedCity);

  const [details, setDetails] = useState(null);
  const [credits, setCredits] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = 'f01590393779565a76ca419d3e3d11e6';
  const IMG_BASE = 'https://image.tmdb.org/t/p/w185';

  const genres = (movie.movieGenres || []).join(" • ");

  useEffect(() => {
    let mounted = true;
    const fetchDetails = async () => {
      if (!movie || !movie.movieId) return;
      setLoading(true);
      setError(null);
      try {
        const [detailsRes, creditsRes, videosRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${movie.movieId}?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/movie/${movie.movieId}/credits?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/movie/${movie.movieId}/videos?api_key=${API_KEY}`),
        ]);

        const detailsJson = await detailsRes.json();
        const creditsJson = await creditsRes.json();
        const videosJson = await videosRes.json();

        // find a YouTube trailer
        let key = null;
        if (videosJson && Array.isArray(videosJson.results)) {
          const ytTrailer = videosJson.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
                           || videosJson.results.find(v => v.site === 'YouTube');
          if (ytTrailer) key = ytTrailer.key;
        }

        if (mounted) {
          setDetails(detailsJson);
          setCredits(creditsJson);
          setTrailerKey(key);
        }
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => { mounted = false; };
  }, [movie]);

  const handlePlay = async () => {
    if (!trailerKey) {
      Alert.alert('Trailer not available', 'No trailer found for this movie.');
      return;
    }
    const youtubeUrl = `https://www.youtube.com/watch?v=${trailerKey}`;
    try {
      const supported = await Linking.canOpenURL(youtubeUrl);
      if (supported) {
        await Linking.openURL(youtubeUrl);
      } else {
        // fallback to browser
        await Linking.openURL(youtubeUrl);
      }
    } catch (e) {
      Alert.alert('Unable to open trailer', e.message || 'An error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
            navigation.goBack() 
        console.log("The back button was pressed");
        }} style={styles.iconBtn}>
          <Text style={styles.iconText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{movie.movieName}</Text>
        <TouchableOpacity onPress={() => {
            navigation.goBack()
        }} style={styles.iconBtn}>
          <Text style={styles.iconText}>⤴</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Poster / Trailer thumbnail */}
        <View>
          <Image
            source={{ uri: movie.moviePoster }}
            style={styles.poster}
            resizeMode="stretch"
          />

          {/* Play overlay */}
          <TouchableOpacity style={styles.playOverlay} onPress={() => handlePlay() }>
            <View style={styles.playButton}>
              <Text style={styles.playText}>▶</Text>
            </View>
            <Text style={styles.playLabel}>Trailer</Text>
          </TouchableOpacity>

          {/* In cinemas badge */}
          <View style={styles.inCinemasBadge}>
            <Text style={styles.inCinemasText}>In cinemas</Text>
          </View>
        </View>

        {/* Interested card */}
        {/* <View style={styles.interestCard}>
          <View style={styles.interestLeft}>
            <Text style={styles.thumb}>👍</Text>
            <Text style={styles.interestCount}>{movie.interestedCount || '18.6K'}</Text>
            <Text style={styles.interestLabel}>are interested</Text>
          </View>
          <TouchableOpacity style={styles.interestBtn} onPress={() => {}}>
            <Text style={styles.interestBtnText}>I'm interested</Text>
          </TouchableOpacity>
        </View> */}

        {/* Chips and metadata */}
        <View style={styles.metaRow}>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>2D</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>{movie.movieLanguage}</Text></View>
          </View>
          <Text style={styles.metaText}>{movie.duration || '2h 2m'} • {genres || 'Drama, Family'} • {movie.censor || 'UA'} • {movie.releaseDate || '22 Nov, 2024'}</Text>
        </View>

        {/* Title and genres */}
        <Text style={styles.title}>{movie.movieName}</Text>
        <Text style={styles.genres}>{genres || 'No genres available'}</Text>

        {/* Description / Overview */}
        <Text style={styles.desc}>{details?.overview || movie.description || 'No description available.'}</Text>

        {/* Production & Language */}
        {details && (
          <View style={styles.productionRow}>
            <Text style={styles.prodLabel}>Language: </Text>
            <Text style={styles.prodValue}>{details.original_language || movie.movieLanguage || 'N/A'}</Text>
            <Text style={[styles.prodLabel, { marginLeft: 12 }]}>Production: </Text>
            <Text style={styles.prodValue} numberOfLines={1}>{(details.production_companies || []).map(p=>p.name).join(', ') || 'N/A'}</Text>
          </View>
        )}

        {/* Cast Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cast</Text>
          {loading && <ActivityIndicator size="small" color="#ff2e63" />}
          {!loading && credits && Array.isArray(credits.cast) && credits.cast.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castScroll}>
              {credits.cast.slice(0, 20).map((c) => (
                <View key={c.credit_id || c.cast_id || c.id} style={styles.castItem}>
                  <Image
                    source={{ uri: c.profile_path ? (IMG_BASE + c.profile_path) : 'https://via.placeholder.com/92x138?text=No+Image' }}
                    style={styles.castImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.castName} numberOfLines={1}>{c.name}</Text>
                  <Text style={styles.castChar} numberOfLines={1}>{c.character}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (!loading && <Text style={{ color: '#666', marginTop: 8 }}>No cast data available.</Text>)}
        </View>

        {/* Advertisement banner placeholder */}
        <Image
          source={{ uri: movie.adBanner || 'https://via.placeholder.com/320x100?text=Ad+Banner' }}
          style={styles.adBanner}
          resizeMode="cover"
        />

        {/* Spacer so content above bottom button is visible */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky bottom book button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
            // navigate to Shows screen and pass movieId and city
            navigation.navigate('Shows', { 
              movieId: movie.movieId, 
              movie,
              city: selectedCity
            });
          }}
        >
          <Text style={styles.bookText}>Book tickets</Text>
        </TouchableOpacity>
      </View>
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
  },
  poster: {
    width: "100%",
    height: 250,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    marginHorizontal: 15,
  },
  genres: {
    fontSize: 14,
    color: "gray",
    marginTop: 5,
    marginHorizontal: 15,
  },
  desc: {
    fontSize: 15,
    margin: 15,
    lineHeight: 22,
    color: "#333",
  },
  header: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  iconBtn: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginTop : 20,
  },
  iconText: {
    fontSize: 46,
    color: "#111",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
    marginTop : 40,
  },
  playOverlay: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  playText: {
    color: "#fff",
    fontSize: 22,
    marginLeft: 4,
  },
  playLabel: {
    marginTop: 8,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
    fontSize: 13,
  },
  inCinemasBadge: {
    position: "absolute",
    bottom: 12,
    left: 16,
    backgroundColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inCinemasText: { color: "#fff", fontWeight: "600" },
  interestCard: {
    marginHorizontal: 14,
    marginTop: -24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  interestLeft: { flexDirection: "row", alignItems: "center" },
  thumb: { fontSize: 18, marginRight: 8 },
  interestCount: { fontWeight: "700", fontSize: 16, marginRight: 8 },
  interestLabel: { color: "#666" },
  interestBtn: {
    borderColor: "#ff2e63",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  interestBtnText: { color: "#ff2e63", fontWeight: "600" },
  metaRow: { paddingHorizontal: 16, marginTop: 12 },
  chipsRow: { flexDirection: "row", marginBottom: 8 },
  chip: {
    backgroundColor: "#eee",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  chipText: { fontSize: 12, fontWeight: "600" },
  metaText: { color: "#666", fontSize: 13 },
  adBanner: { width: "92%", height: 110, alignSelf: "center", marginTop: 18, borderRadius: 8 },
  bottomContainer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  bookButton: {
    backgroundColor: "#ff2e63",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  bookText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  productionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 6 },
  prodLabel: { color: '#666', fontWeight: '600', fontSize: 13 },
  prodValue: { color: '#333', fontSize: 13, flexShrink: 1 },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  castScroll: { paddingVertical: 6 },
  castItem: { width: 92, marginRight: 12, alignItems: 'center' },
  castImage: { width: 92, height: 138, borderRadius: 8, backgroundColor: '#eee' },
  castName: { marginTop: 6, fontSize: 12, fontWeight: '600' },
  castChar: { fontSize: 11, color: '#666' },
});
