/**
 * Marathon Coach API - Backend Server
 * Intègre Strava OAuth + Claude AI pour coaching personnalisé
 */

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// CONFIGURATION
// ============================================

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3000/callback';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// In-memory storage (remplacer par DB en prod)
const users = new Map();

// ============================================
// STRAVA OAUTH
// ============================================

// Step 1: Redirect user to Strava authorization
app.get('/api/auth/strava', (req, res) => {
  const scope = 'read,activity:read_all,profile:read_all';
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${STRAVA_REDIRECT_URI}&scope=${scope}&approval_prompt=auto`;
  res.json({ authUrl });
});

// Step 2: Handle OAuth callback
app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.access_token) {
      const userId = tokenData.athlete.id;
      users.set(userId, {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_at,
        athlete: tokenData.athlete
      });

      res.redirect(`http://localhost:5173?userId=${userId}&name=${tokenData.athlete.firstname}`);
    } else {
      res.status(400).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

// Refresh token helper
async function refreshStravaToken(userId) {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: user.refreshToken,
      grant_type: 'refresh_token'
    })
  });

  const data = await response.json();
  user.accessToken = data.access_token;
  user.refreshToken = data.refresh_token;
  user.expiresAt = data.expires_at;
  users.set(userId, user);

  return user.accessToken;
}

// ============================================
// STRAVA DATA ENDPOINTS
// ============================================

// Get athlete profile
app.get('/api/athlete/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = users.get(parseInt(userId));

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user.athlete);
});

// Get recent activities
app.get('/api/activities/:userId', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, perPage = 30 } = req.query;
  const user = users.get(parseInt(userId));

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    // Refresh token if needed
    if (Date.now() / 1000 > user.expiresAt) {
      await refreshStravaToken(parseInt(userId));
    }

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      }
    );

    const activities = await response.json();

    // Filter running activities only
    const runs = activities.filter(a => a.type === 'Run').map(a => ({
      id: a.id,
      name: a.name,
      date: a.start_date_local,
      distance: a.distance, // meters
      duration: a.moving_time, // seconds
      pace: a.moving_time / (a.distance / 1000), // sec/km
      elevationGain: a.total_elevation_gain,
      averageHeartrate: a.average_heartrate,
      maxHeartrate: a.max_heartrate,
      sufferScore: a.suffer_score
    }));

    res.json(runs);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get athlete stats
app.get('/api/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = users.get(parseInt(userId));

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/athletes/${userId}/stats`,
      {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      }
    );

    const stats = await response.json();
    res.json({
      recentRuns: stats.recent_run_totals,
      yearRuns: stats.ytd_run_totals,
      allTimeRuns: stats.all_run_totals
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============================================
// AI COACHING ENDPOINTS
// ============================================

// Generate personalized training plan
app.post('/api/coach/plan', async (req, res) => {
  const { userId, marathonDate, targetTime, currentLevel, weeklyAvailability } = req.body;
  const user = users.get(parseInt(userId));

  // Fetch recent activities for context
  let activitiesContext = '';
  if (user) {
    try {
      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=20`,
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      const activities = await response.json();
      const runs = activities.filter(a => a.type === 'Run').slice(0, 10);

      activitiesContext = runs.map(r =>
        `- ${new Date(r.start_date_local).toLocaleDateString()}: ${(r.distance/1000).toFixed(1)}km en ${Math.floor(r.moving_time/60)}min (${(r.moving_time/60/(r.distance/1000)).toFixed(2)} min/km)`
      ).join('\n');
    } catch (e) {
      console.error('Error fetching activities for AI:', e);
    }
  }

  const prompt = `Tu es un coach marathon expert. Génère un plan d'entraînement personnalisé.

PROFIL ATHLÈTE:
- Objectif: Marathon le ${marathonDate}
- Temps visé: ${targetTime}
- Niveau actuel: ${currentLevel}
- Disponibilité: ${weeklyAvailability} jours/semaine

ACTIVITÉS RÉCENTES STRAVA:
${activitiesContext || 'Pas de données disponibles'}

INSTRUCTIONS:
1. Calcule le nombre de semaines jusqu'au marathon
2. Crée un plan structuré avec phases (base, développement, spécifique, affûtage)
3. Pour chaque semaine, détaille: volume total, séances clés, objectifs
4. Adapte les allures selon le niveau et l'objectif

Réponds en JSON avec cette structure:
{
  "weeksToMarathon": number,
  "phases": [
    {
      "name": "string",
      "weeks": [startWeek, endWeek],
      "focus": "string"
    }
  ],
  "weeklyPlans": [
    {
      "week": number,
      "phase": "string",
      "totalKm": number,
      "sessions": [
        {
          "day": "string",
          "type": "string", // "repos" | "footing" | "fractionné" | "sortie_longue" | "seuil" | "ppg"
          "duration": "string",
          "description": "string",
          "targetPace": "string" // ex: "5'30/km"
        }
      ],
      "weeklyTip": "string"
    }
  ],
  "keyWorkouts": ["string"],
  "paceZones": {
    "easy": "string",
    "marathon": "string",
    "threshold": "string",
    "interval": "string"
  }
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      res.json(plan);
    } else {
      res.json({ raw: responseText });
    }
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'Failed to generate plan' });
  }
});

// Get nutrition advice for a specific session
app.post('/api/coach/nutrition', async (req, res) => {
  const { sessionType, sessionTime, duration, userWeight } = req.body;

  const prompt = `Tu es un nutritionniste sportif spécialisé marathon. Donne des conseils nutrition TIMING pour cette séance.

SÉANCE:
- Type: ${sessionType}
- Heure prévue: ${sessionTime}
- Durée estimée: ${duration}
- Poids athlète: ${userWeight || 70}kg

Réponds en JSON:
{
  "before": {
    "timing": "string", // ex: "3h avant", "1h avant", "30min avant"
    "meals": [
      {
        "when": "string",
        "what": "string",
        "why": "string",
        "calories": number,
        "macros": { "carbs": number, "protein": number, "fat": number }
      }
    ],
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
    "meal": {
      "what": "string",
      "why": "string",
      "macros": { "carbs": number, "protein": number, "fat": number }
    },
    "hydration": "string",
    "recovery": ["string"]
  },
  "tips": ["string"]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.json({ raw: responseText });
    }
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'Failed to generate nutrition advice' });
  }
});

// Chat with AI coach
app.post('/api/coach/chat', async (req, res) => {
  const { userId, message, conversationHistory = [] } = req.body;

  // Build context from user data
  let userContext = '';
  const user = users.get(parseInt(userId));
  if (user) {
    userContext = `Athlète: ${user.athlete.firstname}, préparation marathon.`;
  }

  const systemPrompt = `Tu es un coach marathon bienveillant et expert. Tu accompagnes des coureurs dans leur préparation.
${userContext}

Règles:
- Réponses concises et actionnables
- Encourage mais reste réaliste
- Adapte le vocabulaire au niveau du coureur
- Pour les questions médicales, recommande de consulter un professionnel
- Utilise des emojis avec parcimonie pour rester motivant`;

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
});

// Analyze performance and suggest improvements
app.post('/api/coach/analyze', async (req, res) => {
  const { userId } = req.body;
  const user = users.get(parseInt(userId));

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    // Fetch last 30 days of activities
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=50`,
      { headers: { Authorization: `Bearer ${user.accessToken}` } }
    );
    const activities = await response.json();
    const runs = activities.filter(a => a.type === 'Run');

    const analysisData = runs.map(r => ({
      date: r.start_date_local,
      distance: (r.distance / 1000).toFixed(1),
      pace: (r.moving_time / 60 / (r.distance / 1000)).toFixed(2),
      hr: r.average_heartrate,
      elevation: r.total_elevation_gain
    }));

    const prompt = `Analyse ces données d'entraînement course à pied et donne des recommandations.

DONNÉES (30 derniers jours):
${JSON.stringify(analysisData, null, 2)}

Réponds en JSON:
{
  "summary": {
    "totalKm": number,
    "avgWeeklyKm": number,
    "avgPace": "string",
    "trend": "improving" | "stable" | "declining"
  },
  "strengths": ["string"],
  "areasToImprove": ["string"],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "area": "string",
      "action": "string"
    }
  ],
  "nextWeekFocus": "string"
}`;

    const aiResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = aiResponse.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.json({ raw: responseText });
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze performance' });
  }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🏃 Marathon Coach API running on port ${PORT}`);
  console.log(`📊 Strava OAuth: http://localhost:${PORT}/api/auth/strava`);
});
