import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";
import { getPricesForProduct } from "@/services/catalog";
import type { PriceRow } from "@/lib/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ProductPrices">;

export default function ProductPricesScreen({ route }: Props) {
  const { productId, productName } = route.params;
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPricesForProduct(productId)
      .then(setPrices)
      .catch((e) => setError(e.message ?? "Erro ao carregar preços"))
      .finally(() => setLoading(false));
  }, [productId]);

  const lowest = prices[0]?.value;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{productName}</Text>
      <Text style={styles.subtitle}>Preços encontrados nas lojas cadastradas</Text>
      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={prices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Nenhuma loja informou preço para este produto ainda.</Text> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{item.establishment?.name ?? "Loja"}</Text>
              <Text style={styles.storeMeta}>{item.establishment?.neighborhood ?? ""}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.price, item.value === lowest && { color: colors.accent }]}>R$ {item.value.toFixed(2)}</Text>
              {item.value === lowest && <Text style={styles.bestTag}>Melhor preço</Text>}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 16, marginHorizontal: 16 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginHorizontal: 16, marginTop: 4 },
  error: { color: colors.danger, marginHorizontal: 16, marginTop: 8 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 24 },
  card: { flexDirection: "row", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, alignItems: "center" },
  storeName: { fontSize: 15, fontWeight: "700", color: colors.text },
  storeMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: 17, fontWeight: "800", color: colors.text },
  bestTag: { fontSize: 11, color: colors.accent, fontWeight: "700", marginTop: 2 },
});
