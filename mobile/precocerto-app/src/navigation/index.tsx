import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "@/screens/HomeScreen";
import SearchScreen from "@/screens/SearchScreen";
import ProductPricesScreen from "@/screens/ProductPricesScreen";
import MerchantLoginScreen from "@/screens/MerchantLoginScreen";
import MerchantSignupScreen from "@/screens/MerchantSignupScreen";
import MerchantDashboardScreen from "@/screens/MerchantDashboardScreen";
import { colors } from "@/theme";

export type RootStackParamList = {
  Home: undefined;
  Search: { initialQuery?: string } | undefined;
  ProductPrices: { productId: string; productName: string };
  MerchantLogin: undefined;
  MerchantSignup: undefined;
  MerchantDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "PreçoCerto" }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: "Buscar" }} />
        <Stack.Screen name="ProductPrices" component={ProductPricesScreen} options={{ title: "Comparar preços" }} />
        <Stack.Screen name="MerchantLogin" component={MerchantLoginScreen} options={{ title: "Portal do lojista" }} />
        <Stack.Screen name="MerchantSignup" component={MerchantSignupScreen} options={{ title: "Cadastrar loja" }} />
        <Stack.Screen name="MerchantDashboard" component={MerchantDashboardScreen} options={{ title: "Meu painel", headerBackVisible: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
