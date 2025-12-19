export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;

  try {
    // Usando a versão estável v1 e o modelo Gemini Pro (mais compatível)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_KEY}`, {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    
    // Se a Google devolver um erro, mostramos no log da Vercel para sabermos o que é
    if (data.error) {
      console.error("Erro da Google:", data.error);
      return res.status(500).json({ reply: "Erro na chave ou permissão da Google." });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lamento, não consegui processar a resposta.";
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ error: "Erro na API" });
  }
}
