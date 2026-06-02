import { chunk as atom } from 'stunk'
import { supabase } from '@repo/shared'
import type { Session, User } from '@supabase/supabase-js'
import { persist } from "stunk/middleware";

export const sessionAtom = atom<Session | null>(null)
export const userAtom = persist(atom<User | null>(null), { key: "user-store" })
export const authReady = atom<boolean>(false)
export async function initAuth() {
  const { data } = await supabase.auth.getSession()
  sessionAtom.set(data.session??null)
  userAtom.set(data.session?.user ?? null)
  authReady.set(true)

  supabase.auth.onAuthStateChange((_event, session) => {
    sessionAtom.set(session??null)
    userAtom.set(session?.user ?? null)
  })
}

export async function signOut() {
  await supabase.auth.signOut()
  sessionAtom.set(null)
  userAtom.set(null)
}
