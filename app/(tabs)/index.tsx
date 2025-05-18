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
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2;

function PhotoItem({ item }) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <Link href={`/photo/${item.id}`} asChild>
      <Pressable style={styles.photoContainer}>
        {imageLoading && (
          <View style={styles.skeleton}>
            <ActivityIndicator size="small" color="#888" />
          </View>
        )}
        <Image
          source={{ uri: item.urls.regular }}
          style={styles.photo}
          contentFit="cover"
          transition={300}
          cachePolicy="disk"
          onLoadEnd={() => setImageLoading(false)}
        />
      </Pressable>
    </Link>
  );
}

export default function ExploreScreen() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const loadPhotos = useCallback(async (pageToLoad = 1) => {
    if (pageToLoad === 1) {
      setLoading(true);
    }

    try {
      const data = await getRandomPhotos(30, pageToLoad);
      setPhotos(prev =>
        pageToLoad === 1 ? data : [...prev, ...data]
      );
      setPage(pageToLoad);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPhotos(1);
  }, [loadPhotos]);

  const loadMorePhotos = () => {
    if (!loading) {
      loadPhotos(page + 1);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  if (loading && photos.length === 0) {
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
        contentContainerStyle={{ paddingTop: 130 }} // increased padding
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={130}  // e.g. 80 or 130
          />
        }
        onEndReached={loadMorePhotos}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => <PhotoItem item={item} />}
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
  skeleton: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
