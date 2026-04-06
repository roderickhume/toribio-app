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
        model: "llama-3.3-70b-versatile",   // o "qwen-qwq-32b" si prefieres
        messages: [{ role: "user", content: req.body.contents[0].parts[0].text }],
        temperature: 0.1,
        response_format: { type: "json_object" }   // Fuerza salida JSON
      })
    });

    const data = await response.json();
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Error con Groq" });
  }
}
