import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const CATEGORIES = [
  { label: "Mercados", icon: "🛒" },
  { label: "Padarias", icon: "🥖" },
  { label: "Açougues", icon: "🥩" },
  { label: "Farmácias", icon: "💊" },
  { label: "Lanchonetes", icon: "🍔" },
  { label: "Ofertas", icon: "🏷️" },
];

export default function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1601599963565-b7f49deb2c8f?q=80&w=1200",
        }}
        style={styles.hero}
        imageStyle={{ opacity: 0.55 }}
      >
        <View style={styles.heroOverlay}>
          <Text style={styles.heroBadge}>O menor preço perto de você</Text>
          <Text style={styles.heroTitle}>
            Compare preços{"\n"}e <Text style={{ color: colors.accent }}>economize</Text> sempre
          </Text>
          <Text style={styles.heroSubtitle}>
            Encontre os menores preços nos comércios da sua cidade e aproveite as melhores ofertas.
          </Text>

          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar produto..."
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => navigation.navigate("Search", { initialQuery: query })}
            >
              <Text style={styles.searchButtonText}>Buscar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore por categoria</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.label}
              style={styles.categoryCard}
              onPress={() => navigation.navigate("Search", { initialQuery: c.label })}
            >
              <Text style={styles.categoryIcon}>{c.icon}</Text>
              <Text style={styles.categoryLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.merchantCta}
          onPress={() => navigation.navigate("MerchantLogin")}
        >
          <Text style={styles.merchantCtaTitle}>Tem uma loja ou comércio?</Text>
          <Text style={styles.merchantCtaSubtitle}>
            Cadastre seus produtos, preços e serviços e venda pelo app →
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { minHeight: 420, backgroundColor: colors.primary, justifyContent: "flex-end" },
  heroOverlay: { padding: 24, paddingBottom: 32, backgroundColor: "rgba(15,61,46,0.55)" },
  heroBadge: {
    alignSelf: "flex-start",
    color: colors.accent,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
  },
  heroTitle: { fontSize: 32, fontWeight: "800", color: "#fff", lineHeight: 38 },
  heroSubtitle: { color: "#e2e8f0", marginTop: 12, fontSize: 15, lineHeight: 21 },
  searchRow: { flexDirection: "row", marginTop: 20, gap: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
  },
  searchButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 10,
  },
  searchButtonText: { color: "#fff", fontWeight: "700" },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 12 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoryCard: {
    width: "30%",
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: "center",
  },
  categoryIcon: { fontSize: 24, marginBottom: 6 },
  categoryLabel: { fontSize: 13, fontWeight: "600", color: colors.text },
  merchantCta: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
  },
  merchantCtaTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  merchantCtaSubtitle: { color: "#cbd5e1", marginTop: 6 },
});
