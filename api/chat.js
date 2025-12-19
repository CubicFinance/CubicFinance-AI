export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verificação de segurança: Se a chave falhar, avisamos logo
  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    return res.status(200).json({ reply: "Erro: A chave API não foi detetada pela Vercel." });
  }

  const { message } = req.body;

  try {
    // TENTATIVA 1: Usando a versão v1 (mais estável)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Se a v1 falhar, tentamos a v1beta automaticamente no log para diagnóstico
      return res.status(200).json({ 
        reply: `Erro da Google: ${data.error.message}. Verifique se a chave no Google AI Studio está ativa para o modelo 1.5 Flash.` 
      });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(500).json({ reply: "Erro crítico no servidor Vercel." });
  }
}
