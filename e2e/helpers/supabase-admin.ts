import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.test"
    )
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function confirmUser(email: string) {
  const admin = createAdminClient()
  const { data: users } = await admin.auth.admin.listUsers()
  const user = users?.users.find((u) => u.email === email)
  if (!user) throw new Error(`User not found: ${email}`)
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  })
  if (error) throw error
}
