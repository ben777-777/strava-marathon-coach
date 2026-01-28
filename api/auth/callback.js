// Vercel Serverless Function - Strava OAuth callback
export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.access_token) {
      // Redirect to frontend with user info
      const redirectUrl = `/?userId=${tokenData.athlete.id}&name=${encodeURIComponent(tokenData.athlete.firstname)}&token=${tokenData.access_token}`;
      res.redirect(302, redirectUrl);
    } else {
      res.status(400).json({ error: 'Authentication failed', details: tokenData });
    }
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
}
