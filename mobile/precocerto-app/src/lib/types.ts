export type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  size: string | null;
  unit: string | null;
  image_url: string | null;
  slug: string | null;
};

export type Establishment = {
  id: string;
  name: string;
  neighborhood: string | null;
  kind: string | null;
  logo_url: string | null;
  is_verified: boolean | null;
  address: string | null;
};

export type PriceRow = {
  id: string;
  product_id: string;
  establishment_id: string;
  value: number;
  previous_value: number | null;
  captured_at: string;
  establishment?: Establishment;
};

export type MerchantProduct = {
  id: string;
  merchant_id: string;
  product_name: string;
  price: number;
  promotional_price: number | null;
  stock_quantity: number | null;
  active: boolean | null;
  image_url: string | null;
};
