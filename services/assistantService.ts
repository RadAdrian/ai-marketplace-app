
import { supabase } from './supabaseClient';
import { AIAssistant, NewAIAssistant } from '../types';

const ASSISTANTS_TABLE = 'assistants';

export const fetchAssistants = async (): Promise<AIAssistant[]> => {
  const { data, error } = await supabase
    .from(ASSISTANTS_TABLE)
    .select('id, name, tagline, description, category, price, image_url, features, system_prompt, accent_color, created_at') // Explicitly select columns
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assistants:', error);
    throw new Error(error.message);
  }
  if (!data) {
    console.warn('No data returned from fetchAssistants, returning empty array.');
    return [];
  }

  // Map Supabase snake_case columns to our camelCase AIAssistant type
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    tagline: item.tagline,
    description: item.description,
    category: item.category,
    price: item.price,
    imageUrl: item.image_url, // map from snake_case
    features: item.features,
    systemPrompt: item.system_prompt, // map from snake_case
    accentColor: item.accent_color, // map from snake_case
    created_at: item.created_at,
  }));
};

export const addAssistant = async (assistantData: NewAIAssistant): Promise<AIAssistant> => {
  // Map frontend camelCase field names from NewAIAssistant to Supabase snake_case column names
  const dataToInsert: any = { // Use 'any' or a more specific type if you have one for insert
    name: assistantData.name,
    tagline: assistantData.tagline,
    description: assistantData.description,
    category: assistantData.category,
    price: assistantData.price,
    features: assistantData.features,
    image_url: assistantData.imageUrl,        // map to snake_case
    system_prompt: assistantData.systemPrompt,  // map to snake_case
    accent_color: assistantData.accentColor,    // map to snake_case
  };

  // If you later add a user_id column to your 'assistants' table
  // and pass it in assistantData (e.g., from a logged-in user's ID):
  // if (assistantData.user_id) { // Assuming user_id might be part of an extended NewAIAssistant type
  //   dataToInsert.user_id = assistantData.user_id;
  // }
  // Or, get current user from Supabase auth within this function if needed,
  // but it's often better to pass it explicitly for testability and separation of concerns.

  const { data, error } = await supabase
    .from(ASSISTANTS_TABLE)
    .insert([dataToInsert])
    .select('id, name, tagline, description, category, price, image_url, features, system_prompt, accent_color, created_at') // Explicitly select columns
    .single();

  if (error) {
    console.error('Error adding assistant:', error);
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error('Failed to add assistant, no data returned from Supabase after insert.');
  }

  // Map returned snake_case data from Supabase to camelCase AIAssistant type
  return {
    id: data.id,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    category: data.category,
    price: data.price,
    imageUrl: data.image_url,       // map from snake_case
    features: data.features,
    systemPrompt: data.system_prompt, // map from snake_case
    accentColor: data.accent_color,   // map from snake_case
    created_at: data.created_at,
    // user_id: data.user_id, // If you added user_id
  };
};
