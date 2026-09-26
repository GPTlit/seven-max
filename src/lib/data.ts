import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Movie = Database["public"]["Tables"]["movies"]["Row"];
export type Screening = Database["public"]["Tables"]["screenings"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type FoodItem = Database["public"]["Tables"]["food_items"]["Row"];
export type FoodOrder = Database["public"]["Tables"]["food_orders"]["Row"];
export type BookingWithShow = Booking & { screening: (Screening & { movie: Movie | null }) | null };

export const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
export const COLS = 12;

export const PAYMENT_METHODS = [
  { id: "bankily", label: "Bankily (BPM)", logo: "/assets/banks/bankily.jpg" },
  { id: "sadad", label: "Sedad", logo: "/assets/banks/sedad.jpg" },
  { id: "masrivi", label: "Masrivi (BMCI)", logo: "/assets/banks/masrivi.jpg" },
  { id: "counter", label: "", logo: "" },
] as const;

export const VIP_PRICE = 1500;

export const todayISO = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString("en-CA");
};

export async function fetchMovies() {
  const { data, error } = await supabase.from("movies").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function fetchScreeningsByDate(date: string) {
  const { data, error } = await supabase
    .from("screenings")
    .select("*, movie:movies(*)")
    .eq("date", date)
    .order("time");
  if (error) throw error;
  return data;
}

export async function uploadReceipt(userId: string, file: File) {
  const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabase.storage.from("receipts").upload(path, file);
  if (error) throw error;
  return path;
}

export async function receiptUrl(path: string) {
  const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 600);
  return data?.signedUrl ?? null;
}

export const hhmm = (t: string) => t.slice(0, 5);
