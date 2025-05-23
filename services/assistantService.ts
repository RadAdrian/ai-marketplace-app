
import { supabase } from './supabaseClient';
import { AIAssistant, NewAIAssistant } from '../types';

const ASSISTANTS_TABLE = 'assistants';

// Define a more specific type for the data being inserted
interface AssistantInsertPayload {
  name: string;
  tagline: string;
  description: string;
  category: string;
  price: string;
  image_url: string;
  features: string[];
  system_prompt: string;
  accent_color: string;
  user_id: string; // Must be a string
}


export const fetchAssistants = async (userId?: string): Promise<AIAssistant[]> => {
  let query = supabase
    .from(ASSISTANTS_TABLE)
    .select('id, name, tagline, description, category, price, image_url, features, system_prompt, accent_color, created_at, user_id')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.is('user_id', null); // Fetch public/template assistants
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching assistants:', error);
    throw new Error(error.message);
  }
  if (!data) {
    console.warn('No data returned from fetchAssistants, returning empty array.');
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    tagline: item.tagline,
    description: item.description,
    category: item.category,
    price: item.price,
    imageUrl: item.image_url,
    features: item.features,
    systemPrompt: item.system_prompt,
    accentColor: item.accent_color,
    created_at: item.created_at,
    user_id: item.user_id,
  }));
};

export const addAssistant = async (assistantData: NewAIAssistant, userId: string): Promise<AIAssistant> => {
  console.log('[assistantService addAssistant] Received userId:', userId);
  console.log('[assistantService addAssistant] Received assistantData:', assistantData);

  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    // This check is crucial. If userId is not a valid string, we should not proceed.
    console.error('[assistantService addAssistant] Invalid userId received:', userId);
    throw new Error('Invalid user ID provided for adding assistant.');
  }

  const dataToInsert: AssistantInsertPayload = {
    name: assistantData.name,
    tagline: assistantData.tagline,
    description: assistantData.description,
    category: assistantData.category,
    price: assistantData.price,
    features: assistantData.features,
    image_url: assistantData.imageUrl,
    system_prompt: assistantData.systemPrompt,
    accent_color: assistantData.accentColor,
    user_id: userId, // Associate with the creating user
  };

  console.log('[assistantService addAssistant] Data being inserted to Supabase:', JSON.stringify(dataToInsert, null, 2));

  const { data, error } = await supabase
    .from(ASSISTANTS_TABLE)
    .insert([dataToInsert])
    .select('id, name, tagline, description, category, price, image_url, features, system_prompt, accent_color, created_at, user_id')
    .single();

  if (error) {
    console.error('Error adding assistant to Supabase:', error);
    throw new Error(`Supabase error: ${error.message} (Details: ${error.details}, Hint: ${error.hint})`);
  }
  if (!data) {
    console.error('[assistantService addAssistant] No data returned from Supabase after insert.');
    throw new Error('Failed to add assistant, no data returned from Supabase after insert.');
  }
  
  console.log('[assistantService addAssistant] Assistant added successfully, returned data:', data);

  return {
    id: data.id,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    category: data.category,
    price: data.price,
    imageUrl: data.image_url,
    features: data.features,
    systemPrompt: data.system_prompt,
    accentColor: data.accent_color,
    created_at: data.created_at,
    user_id: data.user_id,
  };
};
