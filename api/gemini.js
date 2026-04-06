export default async function handler(req, res) {
  // Solo permitimos POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { tab, isStats } = req.body || {};

    // Clave de caché única según el tipo de consulta
    let cacheKey = "gemini_default";
    if (isStats) {
      cacheKey = "stats_chile";
    } else if (tab) {
      cacheKey = `matches_${tab}`;
    }

    // Verificar si Vercel ya tiene caché (Edge CDN)
    const cachedResponse = res.getHeader('x-vercel-cache');
    if (cachedResponse === 'HIT') {
      return; // Ya se sirvió desde caché
    }

    // Llamada real a Gemini
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      }
    );

    const data = await geminiResponse.json();

    // Configuración de caché inteligente
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60'); // 5 minutos fresco + 1 minuto stale
    res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');

    // Headers adicionales para mejor rendimiento
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(geminiResponse.status).json(data);

  } catch (error) {
    console.error("Error en proxy Gemini:", error);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(500).json({ 
      error: "Error al conectar con Gemini",
      message: error.message 
    });
  }
}
