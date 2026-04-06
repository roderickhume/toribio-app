export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "Eres un asistente experto en fútbol chileno. Siempre responde SOLO con JSON válido, sin texto adicional antes o después." 
          },
          { 
            role: "user", 
            content: req.body.contents[0].parts[0].text 
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    // Caché inteligente en Vercel
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=120');
    res.setHeader('Vercel-CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=120');

    return res.status(response.status).json(data);

  } catch (error) {
    console.error("Error en Groq proxy:", error);
    return res.status(500).json({ 
      error: "Error al conectar con Groq",
      message: error.message 
    });
  }
}
