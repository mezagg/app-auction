import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { SplashScreen } from "@/components/SplashScreen";

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Index() {
  console.log(EXPO_PUBLIC_BACKEND_URL, "EXPO_PUBLIC_BACKEND_URL");
  
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Redirigir a la página de subastas
  return <Redirect href="/(tabs)" />;
}
