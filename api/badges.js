export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const credlyRes = await fetch('https://www.credly.com/users/kurt-axl-saludo/badges.json', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Vercel Serverless Function'
      }
    });

    if (!credlyRes.ok) {
      throw new Error(`Credly responded with status: ${credlyRes.status}`);
    }

    const data = await credlyRes.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Credly badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges', details: error.message });
  }
}
