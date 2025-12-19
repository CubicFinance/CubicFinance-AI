export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Teste de diagnóstico: a Vercel consegue ler a chave?
  const key = process.env.GEMINI_KEY;
  
  if (!key || key.length < 5) {
    return res.status(200).json({ 
      reply: "Erro Local: A Vercel não está a injetar a variável GEMINI_KEY. Verifique o nome nas definições da Vercel." 
    });
  }

  const { message } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        reply: `Erro da Google (${data.error.status}): ${data.error.message}` 
      });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(500).json({ reply: "Erro crítico na função da Vercel." });
  }
}
