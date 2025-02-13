import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from '../lib/supabase';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  user: any;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => { },
  signOut: async () => { },
  continueAsGuest: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const androidClientId = Constants.expoConfig?.extra?.androidClientId;
  const iosClientId = Constants.expoConfig?.extra?.iosClientId;
  const webClientId = Constants.expoConfig?.extra?.webClientId;

  const [user, setUser] = useState<any>(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: androidClientId,
    iosClientId: iosClientId,
    webClientId: webClientId,
  });

  useEffect(() => {
    checkIfLoggedIn();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleSignIn(response.authentication?.accessToken);
    }
  }, [response]);

  const checkIfLoggedIn = async () => {
    try {
      const session = await AsyncStorage.getItem("session");
      if (session) {
        const userData = JSON.parse(session);
        setUser(userData);
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/sign-in');
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  };

  const handleGoogleSignIn = async (token: string | undefined) => {
    try {
      if (!token) {
        throw new Error("No access token received");
      }

      // Fetch user data from Google
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const googleUser = await res.json();

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token,
      });

      if (error) {
        throw error;
      }

      const userData = {
        id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
      };

      // Store session locally
      await AsyncStorage.setItem("session", JSON.stringify(userData));
      setUser(userData);

      // Insert or update user in Supabase database
      await supabase.from("users").upsert(
        {
          id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          avatar_url: googleUser.picture,
        },
        { onConflict: "id" }
      );
      router.replace('/(tabs)');
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const signIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("session");
      setUser(null);
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const continueAsGuest = async () => {
    try {
      const guestUser = {
        id: 'guest',
        name: 'Guest User',
        isGuest: true
      };
      await AsyncStorage.setItem("session", JSON.stringify(guestUser));
      setUser(guestUser);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error continuing as guest:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
