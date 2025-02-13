import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { searchPhotos } from '../../lib/unsplash';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const COLORS = [
  { name: 'black_and_white', label: 'B&W' },
  { name: 'black', label: 'Black' },
  { name: 'white', label: 'White' },
  { name: 'yellow', label: 'Yellow' },
  { name: 'orange', label: 'Orange' },
  { name: 'red', label: 'Red' },
  { name: 'purple', label: 'Purple' },
  { name: 'magenta', label: 'Magenta' },
  { name: 'green', label: 'Green' },
  { name: 'teal', label: 'Teal' },
  { name: 'blue', label: 'Blue' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [photos, setPhotos] = useState<{ id: string; urls: { regular: string } }[]>([]);
  const [loading, setLoading] = useState(false);

  const searchImages = useCallback(async () => {
    if (!query && !selectedColor) return;

    setLoading(true);
    try {
      const data = await searchPhotos({
        query,
        color: selectedColor || undefined,
        per_page: 30,
      });
      setPhotos(data.results);
    } catch (error) {
      console.error('Error searching photos:', error);
    } finally {
      setLoading(false);
    }
  }, [query, selectedColor]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#fff" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search wallpapers..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={searchImages}
            returnKeyType="search"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.colorFilters}
          contentContainerStyle={styles.colorFiltersContent}>
          {COLORS.map((color) => (
            <Pressable
              key={color.name}
              style={[
                styles.colorFilter,
                selectedColor === color.name && styles.colorFilterSelected,
              ]}
              onPress={() => {
                setSelectedColor(
                  selectedColor === color.name ? null : color.name
                );
                searchImages();
              }}>
              <Text
                style={[
                  styles.colorFilterText,
                  selectedColor === color.name && styles.colorFilterTextSelected,
                ]}>
                {color.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={photos}
        numColumns={2}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading
                ? 'Searching...'
                : 'Search for wallpapers using keywords or colors'}
            </Text>
          </View>
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20, backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(143, 141, 141, 0.2)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  colorFilters: {
    marginTop: 12,
  },
  colorFiltersContent: {
    paddingRight: 20,
  },
  colorFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
  },
  colorFilterSelected: {
    backgroundColor: '#fff',
  },
  colorFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  colorFilterTextSelected: {
    color: '#000',
  },
  list: {
    paddingTop: 160,
  },
  photoContainer: {
    flex: 1,
    aspectRatio: 0.75,
    padding: 1,
  },
  photo: {
    flex: 1,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});