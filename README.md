# Strava Marathon Coach 🏃‍♂️

Application de coaching marathon avec intégration Strava + IA (Claude API).

## Déployer sur Vercel

### 1. Push sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/strava-marathon-coach.git
git push -u origin main
```

### 2. Connecter à Vercel

1. Va sur [vercel.com/new](https://vercel.com/new)
2. Importe ton repo GitHub
3. Vercel détecte automatiquement Vite

### 3. Configurer les variables d'environnement

Dans Vercel Dashboard → Settings → Environment Variables, ajoute :

| Variable | Valeur |
|----------|--------|
| `STRAVA_CLIENT_ID` | Ton Client ID Strava |
| `STRAVA_CLIENT_SECRET` | Ton Client Secret Strava |
| `STRAVA_REDIRECT_URI` | `https://ton-app.vercel.app/api/auth/callback` |
| `ANTHROPIC_API_KEY` | Ta clé API Anthropic |

### 4. Configurer Strava

1. Va sur [strava.com/settings/api](https://www.strava.com/settings/api)
2. Dans "Authorization Callback Domain", ajoute : `ton-app.vercel.app`

### 5. Redéployer

Après avoir ajouté les variables, clique "Redeploy" dans Vercel.

## Structure

```
├── src/              # Frontend React
│   ├── App.jsx       # Application principale
│   ├── main.jsx      # Point d'entrée
│   └── index.css     # Styles Tailwind
├── api/              # Vercel Serverless Functions
│   ├── auth/
│   │   ├── strava.js    # OAuth initiation
│   │   └── callback.js  # OAuth callback
│   └── coach/
│       ├── chat.js      # Chat IA
│       ├── plan.js      # Génération plan
│       └── nutrition.js # Conseils nutrition
├── vercel.json       # Config Vercel
└── package.json
```

## Développement local

```bash
npm install
npm run dev
```

Pour tester les API functions localement, installe Vercel CLI :

```bash
npm i -g vercel
vercel dev
```

## Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **APIs**: Strava API v3, Claude API
