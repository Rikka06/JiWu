import { API_BASE_URL, FALLBACK_MODELS } from '../constants';
import { Model, ChatMessage, GeneratedResult } from '../types';

export const fetchModels = async (apiKey: string): Promise<Model[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    // Sort models by ID for better readability
    return data.data.sort((a: Model, b: Model) => a.id.localeCompare(b.id));
  } catch (error) {
    console.warn('API fetch failed, using fallback models', error);
    return FALLBACK_MODELS;
  }
};

export const generateReview = async (
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<GeneratedResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: false, // Using non-streaming for simplicity in this version
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No content generated.';
    
    return {
      text: content,
      model: data.model || model,
      usage: data.usage,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Generation failed');
  }
};
