import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/theme";
import { getMyMerchant, getMerchantProducts, upsertMerchantProduct } from "@/services/merchant";
import { supabase } from "@/lib/supabase";
import type { MerchantProduct } from "@/lib/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "MerchantDashboard">;

export default function MerchantDashboardScreen({ navigation }: Props) {
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantStatus, setMerchantStatus] = useState<string | null>(null);
  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const merchant = await getMyMerchant();
      if (!merchant) {
        setError("Nenhuma loja vinculada a este usuário ainda.");
        return;
      }
      setMerchantId(merchant.merchant_id);
      setMerchantStatus((merchant as any).merchants?.status ?? null);
      const items = await getMerchantProducts(merchant.merchant_id);
      setProducts(items);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar painel");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAddProduct() {
    if (!merchantId || !name || !price) return;
    setSaving(true);
    try {
      await upsertMerchantProduct({ merchantId, productName: name, price: parseFloat(price.replace(",", ".")) });
      setName("");
      setPrice("");
      await load();
    } catch (e: any) {
      setError(e.message ?? "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigation.replace("Home");
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  if (error && !merchantId) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogout}><Text style={styles.buttonText}>Sair</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Meu painel</Text>
          <Text style={styles.subtitle}>Status da loja: <Text style={{ fontWeight: "700" }}>{merchantStatus ?? "—"}</Text></Text>
        </View>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logout}>Sair</Text></TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Nome do produto/serviço" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Preço (ex: 19,90)" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
        <TouchableOpacity style={styles.button} onPress={handleAddProduct} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Adicionar / atualizar</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum produto cadastrado ainda.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.product_name}</Text>
            <Text style={styles.cardPrice}>R$ {Number(item.price).toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  logout: { color: colors.danger, fontWeight: "700" },
  form: { marginTop: 20, gap: 10 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, height: 46 },
  button: { backgroundColor: colors.primary, height: 46, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  error: { color: colors.danger, textAlign: "center", marginTop: 40, marginBottom: 16 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 20 },
  card: { flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
  cardPrice: { fontSize: 14, fontWeight: "800", color: colors.accent },
});
