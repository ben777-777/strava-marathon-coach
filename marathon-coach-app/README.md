# Strava Marathon Coach 🏃‍♂️

Application de coaching marathon avec intégration Strava + IA (Claude API) pour programme personnalisé et conseils nutrition timing.

## Features

- **🔗 Connexion Strava OAuth** : Import automatique des activités
- **📊 Plan personnalisé IA** : Programme généré par Claude selon objectif, niveau, disponibilité
- **🍎 Nutrition timing** : Conseils avant/pendant/après chaque séance
- **💬 Coach IA** : Chat avec Claude pour questions training et motivation
- **📈 Stats** : Visualisation des données Strava

## Demo

Le dossier `demo/` contient une version standalone avec données simulées — parfait pour tester l'UX sans configuration.

```bash
cd demo
# Intégrer App.jsx dans un projet Vite/CRA avec Tailwind + lucide-react
```

## Architecture

```
strava-marathon-coach/
├── backend/
│   ├── server.js      # API Express + Strava OAuth + Claude AI
│   ├── package.json
│   └── .env.example
├── frontend/
│   └── App.jsx        # React app (à intégrer dans Vite/CRA)
└── demo/
    └── App.jsx        # Prototype interactif avec données simulées
```

## Setup

### 1. Créer une app Strava

1. Va sur https://www.strava.com/settings/api
2. Crée une application
3. Note le Client ID et Client Secret
4. Configure le callback URL: `http://localhost:3000/callback`

### 2. Obtenir une clé Anthropic

1. Va sur https://console.anthropic.com
2. Crée une API key

### 3. Configurer le backend

```bash
cd backend
cp .env.example .env
# Édite .env avec tes clés
npm install
npm run dev
```

### 4. Lancer le frontend

```bash
# Avec Vite
npm create vite@latest frontend -- --template react
cd frontend
# Copie App.jsx dans src/
npm install lucide-react
npm run dev
```

## API Endpoints

### Auth
- `GET /api/auth/strava` - Retourne l'URL OAuth Strava
- `GET /api/auth/callback` - Callback OAuth

### Strava Data
- `GET /api/athlete/:userId` - Profil athlète
- `GET /api/activities/:userId` - Activités récentes
- `GET /api/stats/:userId` - Statistiques globales

### AI Coach
- `POST /api/coach/plan` - Génère un plan d'entraînement
- `POST /api/coach/nutrition` - Conseils nutrition pour une séance
- `POST /api/coach/chat` - Chat avec le coach IA
- `POST /api/coach/analyze` - Analyse des performances

## Exemple d'utilisation

```javascript
// Générer un plan
const response = await fetch('/api/coach/plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 12345,
    marathonDate: '2026-04-12',
    targetTime: '3h30',
    currentLevel: 'intermédiaire',
    weeklyAvailability: 4
  })
});
const plan = await response.json();

// Obtenir conseils nutrition
const nutrition = await fetch('/api/coach/nutrition', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionType: 'sortie_longue',
    sessionTime: '8h00',
    duration: '1h45',
    userWeight: 72
  })
});
```

## Prochaines étapes (production)

- [ ] Base de données (PostgreSQL/MongoDB) pour persistance utilisateurs
- [ ] Refresh token automatique Strava
- [ ] Webhooks Strava pour sync temps réel
- [ ] PWA pour installation mobile
- [ ] Notifications push pour rappels séances
- [ ] Export PDF du plan
- [ ] Intégration Garmin/Polar

## Stack technique

- **Backend**: Node.js, Express, Anthropic SDK
- **Frontend**: React, Tailwind CSS, Lucide Icons
- **APIs**: Strava API v3, Claude API (claude-sonnet-4-20250514)

---

Built with ❤️ and Claude AI
