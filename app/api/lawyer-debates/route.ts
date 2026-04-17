import { supabase } from "@/lib/db/supabase";

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return Response.json({ error: "Database not configured" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("lawyer_debates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty array gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return Response.json([]);
      }
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data || []);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
