export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;

  try {
    // Usando a URL estável e o nome de modelo universal
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ reply: `Erro na Google: ${data.error.message}` });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lamento, não consegui processar a resposta.";
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ reply: "Erro de ligação ao servidor." });
  }
}
