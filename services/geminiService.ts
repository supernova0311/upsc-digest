import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedNote, MCQ, MainsQuestion, NewsArticle } from '../types';

// Ensure API key is present
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fetchNewsViaAI = async (source: string, topic: string): Promise<NewsArticle[]> => {
  if (!apiKey) throw new Error("API Key missing");

  const model = "gemini-2.5-flash"; // Fast model for search
  const prompt = `Find the latest top 5 news headlines and brief summaries from ${source} related to ${topic} (UPSC relevant). 
  Focus on policy, economy, environment, or international relations. 
  
  STRICTLY return the result as a valid JSON array. 
  Each item must have: "title", "summary", "url" (if found, else empty string), and "publishedDate".
  Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT supported when using tools like googleSearch
        // We must parse the text manually
      }
    });

    let jsonStr = response.text || "[]";
    
    // Clean up potential markdown formatting if the model disregards "raw JSON" instruction
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let data;
    try {
        data = JSON.parse(jsonStr);
    } catch (e) {
        console.warn("Initial JSON parse failed, attempting to extract array:", e);
        // Fallback: try to find array brackets if there is extra text
        const match = jsonStr.match(/\[.*\]/s);
        if (match) {
            try {
                data = JSON.parse(match[0]);
            } catch (e2) {
                console.error("Failed to parse extracted JSON:", e2);
                data = [];
            }
        } else {
            data = [];
        }
    }
    
    if (!Array.isArray(data)) data = [];
    
    return data.map((item: any) => ({
      id: crypto.randomUUID(),
      title: item.title || "No Title",
      source: source,
      url: item.url || '',
      summary: item.summary || "No summary available.",
      publishedDate: item.publishedDate || new Date().toISOString(),
      scrapedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};

export const generateNoteFromContent = async (text: string, sourceName: string): Promise<Omit<GeneratedNote, '_id' | 'createdAt'>> => {
  if (!apiKey) throw new Error("API Key missing");

  const model = "gemini-2.5-flash"; 

  const prompt = `Analyze the following news text for UPSC Civil Services Examination purposes.
  
  Source: ${sourceName}
  Text: "${text.substring(0, 10000)}..."

  1. Classify it into the most relevant GS Paper (GS1, GS2, GS3, GS4).
  2. Create a concise summary (max 150 words).
  3. Generate detailed bullet points for Mains notes.
  4. Create 3 high-quality Prelims MCQs with explanations.
  5. Formulate 1 Mains descriptive question and provide a model answer structure.
  
  Output purely in JSON format conforming to the specified schema.`;

  const noteSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      gsPaper: { type: Type.STRING, enum: ["GS1", "GS2", "GS3", "GS4"] },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      summary: { type: Type.STRING },
      content: { type: Type.STRING, description: "Detailed notes in Markdown format" },
      mcqs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctOption: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          }
        }
      },
      mainsQuestion: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          modelAnswerPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: noteSchema,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for speed on flash model
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      title: result.title || "Untitled Note",
      source: sourceName,
      gsPaper: result.gsPaper as any,
      tags: result.tags || [],
      summary: result.summary || "",
      content: result.content || "",
      mcqs: result.mcqs || [],
      mainsQuestion: result.mainsQuestion
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const generateDailyDigest = async (articles: NewsArticle[]): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");
  const model = "gemini-2.5-flash"; 
  
  const articlesText = articles.map(a => `- ${a.title}: ${a.summary}`).join('\n');
  const prompt = `Create a "Daily Current Affairs Digest" for UPSC students based on these headlines:\n${articlesText}\n\nFormat as a single markdown document with sections: 'Top Stories', 'Economic Updates', 'Environment', and 'Prelims Pointers'.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text || "Failed to generate digest.";
};