// Vercel Serverless Function - Generate Training Plan
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { marathonDate, targetTime, currentLevel, weeklyAvailability, recentActivities } = req.body;

  const prompt = `Tu es un coach marathon expert. Génère un plan d'entraînement personnalisé.

PROFIL ATHLÈTE:
- Objectif: Marathon le ${marathonDate}
- Temps visé: ${targetTime}
- Niveau actuel: ${currentLevel}
- Disponibilité: ${weeklyAvailability} jours/semaine

${recentActivities ? `ACTIVITÉS RÉCENTES:\n${recentActivities}` : ''}

INSTRUCTIONS:
1. Calcule le nombre de semaines jusqu'au marathon
2. Crée un plan structuré avec phases (base, développement, spécifique, affûtage)
3. Pour chaque semaine, détaille: volume total, séances clés, objectifs
4. Adapte les allures selon le niveau et l'objectif

Réponds UNIQUEMENT en JSON valide avec cette structure:
{
  "weeksToMarathon": number,
  "phases": [{"name": "string", "weeks": [start, end], "focus": "string"}],
  "weeklyPlans": [
    {
      "week": number,
      "phase": "string",
      "totalKm": number,
      "sessions": [
        {"day": "string", "type": "string", "duration": "string", "description": "string", "targetPace": "string"}
      ],
      "weeklyTip": "string"
    }
  ],
  "paceZones": {"easy": "string", "marathon": "string", "threshold": "string", "interval": "string"}
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = response.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      res.json(plan);
    } else {
      res.status(500).json({ error: 'Failed to parse AI response', raw: responseText });
    }
  } catch (error) {
    console.error('AI plan error:', error);
    res.status(500).json({ error: 'Failed to generate plan' });
  }
}
