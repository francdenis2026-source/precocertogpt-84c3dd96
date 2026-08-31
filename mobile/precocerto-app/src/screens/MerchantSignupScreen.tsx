import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "@/theme";
import { supabase } from "@/lib/supabase";
import { applyAsMerchant } from "@/services/merchant";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "MerchantSignup">;

export default function MerchantSignupScreen({ navigation }: Props) {
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSignup() {
    setLoading(true); setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      const userId = data.user?.id;
      if (!userId) throw new Error("Não foi possível criar o usuário. Tente novamente.");
      await applyAsMerchant({ userId, businessName, ownerName, phone, email, neighborhood, kind: "loja" });
      setDone(true);
    } catch (e: any) { setError(e.message ?? "Erro ao cadastrar loja"); }
    finally { setLoading(false); }
  }

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cadastro enviado! 🎉</Text>
        <Text style={styles.subtitle}>Sua solicitação foi recebida e está em análise. Você receberá acesso ao painel assim que a loja for aprovada.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}><Text style={styles.buttonText}>Voltar ao início</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastre sua loja</Text>
      <Text style={styles.subtitle}>Venda seus produtos e serviços no comparador de preços e no marketplace.</Text>
      <TextInput style={styles.input} placeholder="Nome do comércio" value={businessName} onChangeText={setBusinessName} />
      <TextInput style={styles.input} placeholder="Seu nome" value={ownerName} onChangeText={setOwnerName} />
      <TextInput style={styles.input} placeholder="Telefone / WhatsApp" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Bairro" value={neighborhood} onChangeText={setNeighborhood} />
      <TextInput style={styles.input} placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar cadastro</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 24 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: 24 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, height: 48, marginBottom: 12 },
  error: { color: colors.danger, marginBottom: 12 },
  button: { backgroundColor: colors.primary, height: 48, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "700" },
});
