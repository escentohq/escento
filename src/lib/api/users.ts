import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppUser, CreateUserInput, UpdateUserInput } from "./types";

function toAppUser(raw: any): AppUser {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    image: raw.image,
    supabaseUserId: raw.supabase_user_id,
    role: raw.role,
  };
}

export async function getUserBySupabaseId(supabaseId: string): Promise<AppUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("supabase_user_id", supabaseId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? toAppUser(data) : null;
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? toAppUser(data) : null;
}

export async function getUserById(id: string): Promise<AppUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? toAppUser(data) : null;
}

export async function createUser(input: CreateUserInput): Promise<AppUser> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user")
    .insert({
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      image: input.image,
      supabase_user_id: input.supabaseUserId,
    })
    .select()
    .single();

  if (error) throw error;
  return toAppUser(data);
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AppUser> {
  const supabase = await createSupabaseServerClient();

  const updateData: Record<string, any> = {};
  if (input.email !== undefined) updateData.email = input.email;
  if (input.name !== undefined) updateData.name = input.name;
  if (input.image !== undefined) updateData.image = input.image;
  if (input.supabaseUserId !== undefined) updateData.supabase_user_id = input.supabaseUserId;
  if (input.role !== undefined) updateData.role = input.role;

  const { data, error } = await supabase
    .from("user")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return toAppUser(data);
}
