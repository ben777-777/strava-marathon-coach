// Vercel Serverless Function - Strava OAuth initiation
export default function handler(req, res) {
  const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
  const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || `${process.env.VERCEL_URL}/api/auth/callback`;

  const scope = 'read,activity:read_all,profile:read_all';
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${STRAVA_REDIRECT_URI}&scope=${scope}&approval_prompt=auto`;

  res.json({ authUrl });
}
