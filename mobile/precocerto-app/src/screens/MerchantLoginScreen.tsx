import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "@/theme";
import { signInMerchant } from "@/services/merchant";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "MerchantLogin">;

export default function MerchantLoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true); setError(null);
    try { await signInMerchant(email, password); navigation.replace("MerchantDashboard"); }
    catch (e: any) { setError(e.message ?? "Não foi possível entrar"); }
    finally { setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portal do lojista</Text>
      <Text style={styles.subtitle}>Entre para gerenciar sua loja, produtos e preços.</Text>
      <TextInput style={styles.input} placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("MerchantSignup")}>
        <Text style={styles.link}>Ainda não tem loja cadastrada? Cadastre sua loja</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: 24 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, height: 48, marginBottom: 12 },
  error: { color: colors.danger, marginBottom: 12 },
  button: { backgroundColor: colors.primary, height: 48, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "700" },
  link: { color: colors.primary, textAlign: "center", marginTop: 18, fontWeight: "600" },
});
