import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const extractDataFromImage = async (imageBuffer) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });

  const imageParts = [
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/jpeg", // Adjust if necessary
      },
    },
  ];

  const prompt = `
    Analyze this image and extract the following information in JSON format:
    {
      "shopName": "string (name of the shop or merchant)",
      "total": "number (total amount)",
      "date": "string (YYYY-MM-DD)",
      "type": "string (must be one of: food, hospital, medical, travel, shopping, grocery, entertainment, other)",
      "invoiceNumber": "string",
      "tax": "number",
      "counter": "string (merchant branch or counter)"
    }
  `;

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    // Fallback if parsing fails but shouldn't be needed with application/json
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw e;
  }
};
