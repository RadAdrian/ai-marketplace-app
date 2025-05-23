
import { supabase } from './supabaseClient';
import type { AuthError, User, SignUpWithPasswordCredentials, SignInWithPasswordCredentials, Session } from '@supabase/supabase-js';

// Fix: Changed function signature to accept credentials object directly
export const signUp = async (credentials: SignUpWithPasswordCredentials): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signUp(credentials);
  return { user: data.user, error };
};

// Fix: Changed function signature to accept credentials object directly
export const signInWithPassword = async (credentials: SignInWithPasswordCredentials): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  return { user: data.user, error };
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Fix: Corrected typo from onAuthStateChanged to onAuthStateChange
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};