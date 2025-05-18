import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { setWallpaper, TYPE_SCREEN } from 'rn-wallpapers';
import { useAuth } from '../../context/auth';
import { supabase } from '../../lib/supabase';

export default function PhotoScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  interface Photo {
    urls: {
      full: string;
      regular: string;
    };
    user: {
      name: string;
    };
    location?: {
      name?: string;
    };
    links: {
      html: string;
    };
  }

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhoto();
    checkIfFavorite();
  }, [id]);

  const fetchPhoto = async () => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/${id}?client_id=${Constants.expoConfig?.extra?.unsplashAccessKey
        }`
      );
      const data = await response.json();
      setPhoto(data);
    } catch (error) {
      console.error('Error fetching photo:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select()
        .eq('user_id', user.id)
        .eq('photo_id', id)
        .single();
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('photo_id', id);
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          photo_id: id,
          photo_data: photo,
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const downloadPhoto = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission required',
          'Enable photo access in settings to save wallpapers');
        return;
      }

      const downloadResult = await FileSystem.downloadAsync(
        `${photo.urls.full}?client_id=${UNSPLASH_KEY}`,
        FileSystem.cacheDirectory + `${id}.jpg`
      );

      const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
      await MediaLibrary.addAssetsToAlbumAsync([asset], 'Wallpapers', false);

      Alert.alert('Success', 'Saved to Wallpapers album');
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Error', 'Failed to save - try development build');
    }
  };

  const setAsWallpaper = async (url: string) => {
    const { uri } = await FileSystem.downloadAsync(
      url,
      FileSystem.cacheDirectory + 'wallpaper.jpg'
    );

    await setWallpaper(
      { uri },
      TYPE_SCREEN.BOTH
    );
  };


  const sharePhoto = async () => {
    if (!photo) {
      Alert.alert('Error', 'Photo not available');
      return;
    }

    try {
      await Share.share({
        message: `Check out this amazing wallpaper by ${photo.user.name} on Unsplash: ${photo.links.html}`,
        url: photo.links.html,
      });
    } catch (error) {
      console.error('Error sharing photo:', error);
    }
  };

  if (loading || !photo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photo.urls.regular }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.photographerName}>Photo by {photo.user.name}</Text>
          <Text style={styles.locationText}>{photo.location?.name || ''}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() =>
              Alert.alert('Set as', 'Choose where to set this wallpaper', [
                {
                  text: 'Home Screen',
                  onPress: () => setAsWallpaper('home'),
                },
                {
                  text: 'Lock Screen',
                  onPress: () => setAsWallpaper('lock'),
                },
                {
                  text: 'Both',
                  onPress: () => setAsWallpaper('both'),
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ])
            }>
            <Ionicons name="phone-portrait" size={24} color="#fff" />
            <Text style={styles.actionText}>Set as</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={downloadPhoto}>
            <Ionicons name="download" size={24} color="#fff" />
            <Text style={styles.actionText}>Save</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={sharePhoto}>
            <Ionicons name="share-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>Share</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#ff3b30' : '#fff'}
            />
            <Text style={styles.actionText}>
              {isFavorite ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(143, 141, 141, 0.2)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 12,
  },
  photographerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(143, 141, 141, 0.2)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
  },
});