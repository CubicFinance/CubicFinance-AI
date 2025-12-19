export default async function handler(req, res) {
  // Configuração de permissões (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;

  try {
    // URL estável v1 com o modelo Flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    
    // Se a Google devolver erro, enviamos para o chat para sabermos o que é
    if (data.error) {
      return res.status(200).json({ reply: `Erro Google: ${data.error.message}` });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta da IA.";
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ reply: "Erro de ligação ao servidor." });
  }
}
