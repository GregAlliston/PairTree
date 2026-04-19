import { supabase, type Category } from "@/lib/supabase";
import { CategoryManager } from "@/components/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const { data } = await supabase()
    .from("categories")
    .select("*")
    .order("name");
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Categories</h1>
      <CategoryManager initial={(data ?? []) as Category[]} />
    </div>
  );
}
