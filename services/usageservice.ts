import { supabase } from './supabaseClient';

const USER_MESSAGE_LOG_TABLE = 'user_message_log';

/**
 * Logs a message sent by an authenticated user.
 * @param userId The ID of the user.
 * @param assistantId The ID of the assistant the message was sent to.
 */
export const logUserMessage = async (userId: string, assistantId: string): Promise<void> => {
  if (!userId || !assistantId) {
    console.warn('logUserMessage called without userId or assistantId.');
    return;
  }
  try {
    const { error } = await supabase
      .from(USER_MESSAGE_LOG_TABLE)
      .insert({ user_id: userId, assistant_id: assistantId }); // sent_at is handled by default in DB

    if (error) {
      console.error('Error logging user message:', error);
      // Not throwing an error here to allow chat to continue even if logging fails,
      // but the usage count might become inaccurate temporarily.
    }
  } catch (catchError) {
    console.error('Catch block error in logUserMessage:', catchError);
  }
};

/**
 * Gets the count of messages a user has sent in the last 24 hours.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the number of messages.
 */
export const getUserMessagesInLast24Hours = async (userId: string): Promise<number> => {
  if (!userId) {
    console.warn('getUserMessagesInLast24Hours called without userId.');
    return 0;
  }
  try {
    // Calculate the timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from(USER_MESSAGE_LOG_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('sent_at', twentyFourHoursAgo);

    if (error) {
      console.error('Error fetching user message count:', error);
      // Return 0 on error to avoid blocking user if count fails.
      // A refresh or new interaction might get the correct count later.
      return 0; 
    }
    return count || 0;
  } catch (catchError) {
    console.error('Catch block error in getUserMessagesInLast24Hours:', catchError);
    return 0; // Return 0 on error
  }
};
