import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "@/theme";
import { searchProducts } from "@/services/catalog";
import type { Product } from "@/lib/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

export default function SearchScreen({ route, navigation }: Props) {
  const [query, setQuery] = useState(route.params?.initialQuery ?? "");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(q: string) {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true); setError(null);
    try { setResults(await searchProducts(q)); }
    catch (e: any) { setError(e.message ?? "Erro ao buscar produtos"); }
    finally { setLoading(false); }
  }

  useEffect(() => { runSearch(query); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => runSearch(query)} placeholder="Buscar produto..." style={styles.input} autoFocus />
        <TouchableOpacity style={styles.button} onPress={() => runSearch(query)}><Text style={styles.buttonText}>Buscar</Text></TouchableOpacity>
      </View>
      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Nenhum produto encontrado. Tente outro termo de busca.</Text> : null}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ProductPrices", { productId: item.id, productName: item.name })}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{[item.brand, item.category, item.size].filter(Boolean).join(" · ") || "—"}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: "row", gap: 8, padding: 16 },
  input: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, height: 46 },
  button: { backgroundColor: colors.primary, paddingHorizontal: 16, justifyContent: "center", borderRadius: 10 },
  buttonText: { color: "#fff", fontWeight: "700" },
  error: { color: colors.danger, marginHorizontal: 16, marginTop: 8 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 24 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  cardSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
