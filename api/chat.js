export default async function handler(req, res) {
  // Configuração de CORS para permitir que o Sitejet comunique com a Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;

  try {
    // Usando o modelo Gemini 2.0 Flash via endpoint v1beta (padrão para modelos 2.0)
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}', {      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        system_instruction: {
          parts: [{ 
            text: "Tu és o assistente oficial da CubicFinance, especialista em Crédito Habitação e Seguros em Portugal. O TEU OBJETIVO: Ajudar os utilizadores a esclarecer dúvidas sobre spread, taxas Euribor, seguros de vida (IAD/ITP) e multirriscos, sempre de acordo com a lei portuguesa (DL 74-A/2017). REGRAS ESTRITAS: 1. Responde apenas sobre temas financeiros e imobiliários relacionados com a CubicFinance. 2. Se te perguntarem algo fora deste âmbito, responde: 'Lamento, mas apenas posso ajudar com questões sobre crédito e seguros. Como posso ajudar a sua poupança hoje?'. 3. Nunca dás conselhos financeiros finais; incentiva sempre o utilizador a falar com um especialista humano da equipa CubicFinance. 4. Tom de voz: Profissional, confiável e focado em poupança." 
          }]
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erro detalhado da Google:", data.error);
      return res.status(200).json({ reply: `Erro de Configuração: ${data.error.message}` });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lamento, não consegui processar o seu pedido agora.";
    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error("Erro na API Route:", error);
    res.status(500).json({ reply: "Ocorreu um erro na ligação ao servidor." });
  }
}
