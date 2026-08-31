import { supabase } from "@/lib/supabase";

export async function signInMerchant(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function applyAsMerchant(params: {
  userId: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  neighborhood: string;
  kind: string;
}) {
  const { error } = await supabase.from("merchant_applications").insert({
    applicant_user_id: params.userId,
    business_name: params.businessName,
    owner_name: params.ownerName,
    phone: params.phone,
    email: params.email,
    neighborhood: params.neighborhood,
    kind: params.kind,
    status: "pending",
  });
  if (error) throw error;
}

export async function getMyMerchant() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("merchant_members")
    .select("merchant_id, role, merchants(id, name, status, plan_code)")
    .eq("user_id", userId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getMerchantProducts(merchantId: string) {
  const { data, error } = await supabase
    .from("merchant_products")
    .select("id, merchant_id, product_name, price, promotional_price, stock_quantity, active, image_url")
    .eq("merchant_id", merchantId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function upsertMerchantProduct(params: {
  id?: string;
  merchantId: string;
  productName: string;
  price: number;
  promotionalPrice?: number | null;
  stockQuantity?: number | null;
  imageUrl?: string | null;
}) {
  const { error } = await supabase.from("merchant_products").upsert({
    id: params.id,
    merchant_id: params.merchantId,
    product_name: params.productName,
    price: params.price,
    promotional_price: params.promotionalPrice ?? null,
    stock_quantity: params.stockQuantity ?? null,
    image_url: params.imageUrl ?? null,
    active: true,
  });
  if (error) throw error;
}
