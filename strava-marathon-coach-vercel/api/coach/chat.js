// Vercel Serverless Function - AI Coach Chat
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, conversationHistory = [] } = req.body;

  const systemPrompt = `Tu es un coach marathon bienveillant et expert. Tu accompagnes des coureurs dans leur préparation au marathon.

Règles:
- Réponses concises et actionnables (max 3-4 phrases)
- Encourage mais reste réaliste
- Pour les questions médicales, recommande de consulter un professionnel
- Utilise des emojis avec parcimonie pour rester motivant
- Parle en français`;

  const messages = [
    ...conversationHistory.map(m => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: message }
  ];

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages
    });

    res.json({ response: response.content[0].text });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to get coach response' });
  }
}
