import { supabase } from './supabase.js'

export async function createLogin(email, password) {
  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw new Error(error.message)
}
