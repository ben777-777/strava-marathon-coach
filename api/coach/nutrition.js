// Vercel Serverless Function - Nutrition Advice
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionType, sessionTime, duration, userWeight } = req.body;

  const prompt = `Tu es un nutritionniste sportif spécialisé marathon. Donne des conseils nutrition TIMING pour cette séance.

SÉANCE:
- Type: ${sessionType}
- Heure prévue: ${sessionTime}
- Durée estimée: ${duration}
- Poids athlète: ${userWeight || 70}kg

Réponds UNIQUEMENT en JSON valide:
{
  "before": {
    "timing": "string",
    "meals": [{"when": "string", "what": "string", "why": "string", "calories": number, "macros": {"carbs": number, "protein": number, "fat": number}}],
    "hydration": "string"
  },
  "during": {
    "needed": boolean,
    "recommendation": "string",
    "products": ["string"],
    "hydrationPerHour": "string"
  },
  "after": {
    "timing": "string",
    "meal": {"what": "string", "why": "string", "macros": {"carbs": number, "protein": number, "fat": number}},
    "hydration": "string",
    "recovery": ["string"]
  },
  "tips": ["string"]
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = response.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('AI nutrition error:', error);
    res.status(500).json({ error: 'Failed to generate nutrition advice' });
  }
}
