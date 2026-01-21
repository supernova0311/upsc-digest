import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fetchNewsViaAI = async (source, topic) => {
  if (!apiKey) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
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
      }
    });

    let jsonStr = response.text || "[]";
    
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let data;
    try {
        data = JSON.parse(jsonStr);
    } catch (e) {
        console.warn("Initial JSON parse failed, attempting to extract array:", e);
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
    
    return data.map((item) => ({
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

export const generateNoteFromContent = async (text, sourceName) => {
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
  
  Output as valid JSON with this structure:
  {
    "title": "string",
    "gsPaper": "GS1|GS2|GS3|GS4",
    "tags": ["string"],
    "summary": "string",
    "content": "string (markdown)",
    "mcqs": [
      {
        "question": "string",
        "options": ["string"],
        "correctOption": 0,
        "explanation": "string"
      }
    ],
    "mainsQuestion": {
      "question": "string",
      "modelAnswerPoints": ["string"]
    }
  }`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });

    let jsonText = response.text || "{}";
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const result = JSON.parse(jsonText);
    
    return {
      title: result.title || "Untitled Note",
      source: sourceName,
      gsPaper: result.gsPaper || "GS2",
      tags: result.tags || [],
      summary: result.summary || "",
      content: result.content || "",
      mcqs: result.mcqs || [],
      mainsQuestion: result.mainsQuestion || { question: "", modelAnswerPoints: [] }
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const generateDailyDigest = async (articles) => {
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
