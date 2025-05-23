

import {AIAssistant} from './types';

// This data is for reference and for seeding your Supabase database.
// The application fetches assistants directly from Supabase at runtime.
// Use the SQL script provided (or generate one based on this data)
// to insert these initial records into your 'assistants' table in Supabase.
// Ensure these records have user_id set to NULL in your database to be treated as public templates.
export const AI_ASSISTANTS_SEED_DATA: Omit<AIAssistant, 'id' | 'created_at'>[] = [
  {
    name: 'WriterPro Assistant',
    tagline: 'Craft compelling content, effortlessly.',
    description: 'WriterPro helps you overcome writer\'s block, generate creative text formats, and polish your writing to perfection. Ideal for marketers, bloggers, and students.',
    category: 'Productivity',
    price: '$29/mo',
    imageUrl: 'https://picsum.photos/seed/writer/600/400',
    features: ['Advanced Grammar & Style Checking', 'Content Generation (Blogs, Ads, Emails)', 'Paraphrasing & Summarization', 'Multiple Tone Adjustments'],
    systemPrompt: 'You are WriterPro, an expert writing assistant. Your goal is to help users create high-quality, engaging, and clear written content. Be encouraging and provide constructive suggestions.',
    accentColor: 'bg-sky-600',
    user_id: null,
  },
  {
    name: 'CodeBuddy AI',
    tagline: 'Your smart coding companion.',
    description: 'CodeBuddy assists developers by generating code snippets, explaining complex algorithms, debugging, and translating code between languages. Supports Python, JavaScript, Java, and more.',
    category: 'Development',
    price: '$49/mo',
    imageUrl: 'https://picsum.photos/seed/code/600/400',
    features: ['Code Generation & Autocompletion', 'Debugging Assistance', 'Algorithm Explanation', 'Language Translation', 'Documentation Lookup'],
    systemPrompt: 'You are CodeBuddy AI, a knowledgeable and helpful programming assistant. Provide concise, accurate, and efficient coding solutions and explanations. When generating code, prioritize clarity and best practices.',
    accentColor: 'bg-emerald-600',
    user_id: null,
  },
  {
    name: 'BizAnalyst AI',
    tagline: 'Unlock data-driven business insights.',
    description: 'BizAnalyst AI processes your business data to identify trends, generate reports, and provide actionable insights for strategic decision-making. Connects to various data sources.',
    category: 'Business',
    price: '$99/mo',
    imageUrl: 'https://picsum.photos/seed/business/600/400',
    features: ['Data Analysis & Visualization', 'Trend Prediction', 'Custom Report Generation', 'KPI Tracking', 'Market Sentiment Analysis'],
    systemPrompt: 'You are BizAnalyst AI, a sharp and insightful business intelligence tool. Your purpose is to transform data into clear, actionable strategies. Focus on data-backed recommendations and concise summaries.',
    accentColor: 'bg-indigo-600',
    user_id: null,
  },
];