// sign-in.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../../context/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

export default function SignIn() {
  const { signIn, continueAsGuest } = useAuth();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', 'transparent']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
      />

      <Image
        source="https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d"
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>PixelScape</Text>
        <Text style={styles.subtitle}>
          Discover and set beautiful wallpapers for your device
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => signIn()}
        >
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.guestButton]}
          onPress={() => continueAsGuest()}
        >
          <Text style={[styles.buttonText, styles.guestButtonText]}>
            Continue as Guest
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    zIndex: 2,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12, // Reduced from 48 to accommodate new button
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    marginBottom: 48,
  },
  guestButtonText: {
    color: '#fff',
  },
});