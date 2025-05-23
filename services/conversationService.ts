
import { supabase } from './supabaseClient';
import { ChatMessage } from '../types';

const CONVERSATIONS_TABLE = 'user_assistant_conversations';

/**
 * Fetches the conversation history for a given user and assistant.
 * @param userId The ID of the user.
 * @param assistantId The ID of the assistant.
 * @returns A promise that resolves to an array of ChatMessage objects or an empty array if no history exists.
 */
export const fetchConversationHistory = async (userId: string, assistantId: string): Promise<ChatMessage[]> => {
  if (!userId || !assistantId) {
    console.warn('fetchConversationHistory called without userId or assistantId');
    return [];
  }
  try {
    const { data, error } = await supabase
      .from(CONVERSATIONS_TABLE)
      .select('history')
      .eq('user_id', userId)
      .eq('assistant_id', assistantId)
      // Removed .single() - we expect an array, which might be empty
      .limit(1); // Still only expect one record if it exists

    if (error) {
      // No need to specifically check for PGRST116 if not using .single()
      // A general error indicates a problem with the query or RLS.
      console.error('Error fetching conversation history:', error);
      throw new Error(error.message);
    }

    // If data is an array and has at least one element, and that element has 'history'
    if (data && data.length > 0 && data[0] && data[0].history) {
      return data[0].history;
    }
    
    // If no record found (data will be an empty array) or history field is missing, return empty array
    return [];

  } catch (error) {
    console.error('Catch block error fetching conversation history:', error);
    // Return empty array on error to allow chat to proceed without history
    return [];
  }
};

/**
 * Saves or updates the conversation history for a given user and assistant.
 * Uses upsert to either insert a new record or update an existing one.
 * @param userId The ID of the user.
 * @param assistantId The ID of the assistant.
 * @param history The array of ChatMessage objects to save.
 * @returns A promise that resolves when the history is saved.
 */
export const saveConversationHistory = async (userId: string, assistantId: string, history: ChatMessage[]): Promise<void> => {
  if (!userId || !assistantId) {
    console.warn('saveConversationHistory called without userId or assistantId');
    return;
  }
  try {
    const { error } = await supabase
      .from(CONVERSATIONS_TABLE)
      .upsert(
        {
          user_id: userId,
          assistant_id: assistantId,
          history: history,
          last_updated_at: new Date().toISOString(), // Explicitly set for upsert
        },
        {
          onConflict: 'user_id, assistant_id', // Specify conflict target for upsert
        }
      );

    if (error) {
      console.error('Error saving conversation history:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Catch block error saving conversation history:', error);
     // Do not re-throw, to allow app to continue functioning locally
  }
};

/**
 * Resets (deletes) the conversation history for a given user and assistant.
 * @param userId The ID of the user.
 * @param assistantId The ID of the assistant.
 * @returns A promise that resolves when the history is reset.
 */
export const resetConversationHistory = async (userId: string, assistantId: string): Promise<void> => {
   if (!userId || !assistantId) {
    console.warn('resetConversationHistory called without userId or assistantId');
    return;
  }
  try {
    const { error } = await supabase
      .from(CONVERSATIONS_TABLE)
      .delete()
      .eq('user_id', userId)
      .eq('assistant_id', assistantId);

    if (error) {
      console.error('Error resetting conversation history:', error);
      throw new Error(error.message);
    }
  } catch (error) {
     console.error('Catch block error resetting conversation history:', error);
     // Do not re-throw
  }
};
