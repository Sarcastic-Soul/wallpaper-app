import { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Text,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { getRandomPhotos } from '../../lib/unsplash';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2;

export default function ExploreScreen() {
  const [photos, setPhotos] = useState<{ id: string; urls: { regular: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPhotos = useCallback(async () => {
    try {
      const data = await getRandomPhotos(30);
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    loadPhotos();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="compass" size={24} color="#fff" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSubtitle}>Discover amazing wallpapers</Text>
          </View>
        </View>
      </View>


      <FlatList
        data={photos}
        numColumns={2}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Link href={`/photo/${item.id}`} asChild>
            <Pressable style={styles.photoContainer}>
              <Image
                source={{ uri: item.urls.regular }}
                style={styles.photo}
                contentFit="cover"
                transition={1000}
              />
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(143, 141, 141, 0.2)', 
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  list: {
    paddingTop: 120,
  },
  photoContainer: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.5,
    padding: 1,
  },
  photo: {
    flex: 1,
    borderRadius: 12,
  },
});