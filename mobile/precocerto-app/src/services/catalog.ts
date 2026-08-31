import { supabase } from "@/lib/supabase";
import { PriceRow, Product } from "@/lib/types";

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, brand, category, size, unit, image_url, slug")
    .ilike("name", `%${query}%`)
    .limit(30);

  if (error) throw error;
  return data ?? [];
}

export async function getPricesForProduct(productId: string): Promise<PriceRow[]> {
  const { data, error } = await supabase
    .from("prices")
    .select("id, product_id, establishment_id, value, previous_value, captured_at, establishment:establishments(id, name, neighborhood, kind, logo_url, is_verified, address)")
    .eq("product_id", productId)
    .order("value", { ascending: true });

  if (error) throw error;
  return (data as unknown as PriceRow[]) ?? [];
}

export async function getFeaturedEstablishments() {
  const { data, error } = await supabase
    .from("establishments")
    .select("id, name, neighborhood, kind, logo_url, is_verified, address")
    .eq("home_featured", true)
    .order("featured_priority", { ascending: true })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}
