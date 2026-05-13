import { createSupabaseServerClient } from "@/lib/supabase/server";

// Convert camelCase to snake_case for DB columns
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    result[snakeKey] = value;
  }
  return result;
}

// Convert snake_case back to camelCase from DB (shallow)
function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

// Export for external use
export const convertSnakeToCamel = toCamelCase;

// Supabase data access layer — mimics Prisma API for minimal migration
export const db = {
  user: {
    findFirst: async (query: { where: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const where = query.where;

      let queryBuilder = supabase.from("user").select("*");

      for (const [key, value] of Object.entries(where)) {
        const column = key === "supabaseUserId" ? "supabase_user_id" : key;
        queryBuilder = queryBuilder.eq(column, value);
      }

      const { data, error } = await queryBuilder.single();
      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    },

    findUnique: async (query: { where: Record<string, unknown> }) => {
      return db.user.findFirst(query);
    },

    update: async (query: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const [whereKey, whereValue] = Object.entries(query.where)[0];
      const column = whereKey === "supabaseUserId" ? "supabase_user_id" : whereKey;

      const data = Object.entries(query.data).reduce(
        (acc, [key, value]) => {
          const dbCol = key === "supabaseUserId" ? "supabase_user_id" : key;
          acc[dbCol] = value;
          return acc;
        },
        {} as Record<string, unknown>
      );

      const { data: result, error } = await supabase
        .from("user")
        .update(data)
        .eq(column, whereValue)
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    create: async (query: { data: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const data = Object.entries(query.data).reduce(
        (acc, [key, value]) => {
          const dbCol = key === "supabaseUserId" ? "supabase_user_id" : key;
          acc[dbCol] = value;
          return acc;
        },
        {} as Record<string, unknown>
      );

      const { data: result, error } = await supabase
        .from("user")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
  },

  musicianProfile: {
    findUnique: async (query: { where: Record<string, unknown>; include?: Record<string, boolean>; select?: Record<string, boolean> }) => {
      const supabase = await createSupabaseServerClient();
      const [whereKey, whereValue] = Object.entries(query.where)[0];
      const whereKeySnake = whereKey === "userId" ? "user_id" : whereKey.replace(/([A-Z])/g, "_$1").toLowerCase();

      let selectStr = "*";
      if (query.select) {
        selectStr = Object.keys(query.select).map(k => k.replace(/([A-Z])/g, "_$1").toLowerCase()).join(",");
      } else if (query.include) {
        if (query.include.instruments) selectStr += ", musician_instrument(*)";
        if (query.include.genres) selectStr += ", musician_genre(*)";
        if (query.include.portfolio) selectStr += ", portfolio_item(*)";
      }

      const { data, error } = await supabase
        .from("musician_profile")
        .select(selectStr)
        .eq(whereKeySnake, whereValue)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;
      return toCamelCase(data as unknown as Record<string, unknown>);
    },

    findMany: async (query?: { where?: Record<string, unknown>; include?: Record<string, boolean>; orderBy?: Record<string, string> }) => {
      const supabase = await createSupabaseServerClient();

      let selectStr = "*";
      if (query?.include) {
        if (query.include.instruments) selectStr += ", musician_instrument(*)";
        if (query.include.genres) selectStr += ", musician_genre(*)";
        if (query.include.portfolio) selectStr += ", portfolio_item(*)";
      }

      let queryBuilder = supabase.from("musician_profile").select(selectStr);

      if (query?.orderBy) {
        for (const [key, dir] of Object.entries(query.orderBy)) {
          queryBuilder = queryBuilder.order(key, { ascending: dir === "asc" });
        }
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data || [];
    },

    update: async (query: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const [whereKey, whereValue] = Object.entries(query.where)[0];
      const column = whereKey === "userId" ? "user_id" : whereKey;

      const data = Object.entries(query.data).reduce(
        (acc, [key, value]) => {
          const dbCol = key === "userId" ? "user_id" : key;
          acc[dbCol] = value;
          return acc;
        },
        {} as Record<string, unknown>
      );

      const { data: result, error } = await supabase
        .from("musician_profile")
        .update(data)
        .eq(column, whereValue)
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    create: async (query: { data: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const data = Object.entries(query.data).reduce(
        (acc, [key, value]) => {
          const dbCol = key === "userId" ? "user_id" : key;
          acc[dbCol] = value;
          return acc;
        },
        {} as Record<string, unknown>
      );

      const { data: result, error } = await supabase
        .from("musician_profile")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
  },

  // Placeholder for additional models — expand as needed
  instrument: {
    findFirst: async (query: { where: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const where = query.where;

      let queryBuilder = supabase.from("instrument").select("*");
      for (const [key, value] of Object.entries(where)) {
        queryBuilder = queryBuilder.eq(key, value);
      }

      const { data, error } = await queryBuilder.single();
      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    },

    findMany: async (query?: { orderBy?: Record<string, string>; select?: Record<string, boolean> }) => {
      const supabase = await createSupabaseServerClient();
      let selectStr = "*";
      if (query?.select) {
        selectStr = Object.keys(query.select).join(",");
      }

      let queryBuilder = supabase.from("instrument").select(selectStr);

      if (query?.orderBy) {
        for (const [key, dir] of Object.entries(query.orderBy)) {
          queryBuilder = queryBuilder.order(key, { ascending: dir === "asc" });
        }
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data || [];
    },

    create: async (query: { data: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const { data: result, error } = await supabase
        .from("instrument")
        .insert(query.data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
  },

  genre: {
    findFirst: async (query: { where: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const where = query.where;

      let queryBuilder = supabase.from("genre").select("*");
      for (const [key, value] of Object.entries(where)) {
        queryBuilder = queryBuilder.eq(key, value);
      }

      const { data, error } = await queryBuilder.single();
      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    },

    findMany: async (query?: { orderBy?: Record<string, string>; select?: Record<string, boolean> }) => {
      const supabase = await createSupabaseServerClient();
      let selectStr = "*";
      if (query?.select) {
        selectStr = Object.keys(query.select).join(",");
      }

      let queryBuilder = supabase.from("genre").select(selectStr);

      if (query?.orderBy) {
        for (const [key, dir] of Object.entries(query.orderBy)) {
          queryBuilder = queryBuilder.order(key, { ascending: dir === "asc" });
        }
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data || [];
    },

    create: async (query: { data: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const { data: result, error } = await supabase
        .from("genre")
        .insert(query.data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
  },

  gig: {
    findUnique: async (query: { where: Record<string, unknown>; include?: Record<string, boolean>; select?: Record<string, boolean> }) => {
      const supabase = await createSupabaseServerClient();
      const [whereKey, whereValue] = Object.entries(query.where)[0];
      const whereKeySnake = whereKey.replace(/([A-Z])/g, "_$1").toLowerCase();

      let selectStr = "*";
      if (query.select) {
        selectStr = Object.keys(query.select).map(k => k.replace(/([A-Z])/g, "_$1").toLowerCase()).join(",");
      } else if (query.include) {
        if (query.include.instruments) selectStr += ", gig_instrument(*)";
        if (query.include.genres) selectStr += ", gig_genre(*)";
        if (query.include.creator) selectStr += ", user(*)";
      }

      const { data, error } = await supabase
        .from("gig")
        .select(selectStr)
        .eq(whereKeySnake, whereValue)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;
      return toCamelCase(data as unknown as Record<string, unknown>);
    },

    findMany: async (query?: { where?: Record<string, unknown>; include?: Record<string, boolean> }) => {
      const supabase = await createSupabaseServerClient();

      let selectStr = "*";
      if (query?.include?.instruments) selectStr += ", gig_instrument(*)";
      if (query?.include?.genres) selectStr += ", gig_genre(*)";
      if (query?.include?.creator) selectStr += ", user(*)";

      let queryBuilder = supabase.from("gig").select(selectStr);

      if (query?.where) {
        for (const [key, value] of Object.entries(query.where)) {
          queryBuilder = queryBuilder.eq(key, value);
        }
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data || [];
    },

    create: async (query: { data: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const { data: result, error } = await supabase
        .from("gig")
        .insert(query.data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    update: async (query: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const supabase = await createSupabaseServerClient();
      const [whereKey, whereValue] = Object.entries(query.where)[0];

      const { data: result, error } = await supabase
        .from("gig")
        .update(query.data)
        .eq(whereKey, whereValue)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
  },
};

