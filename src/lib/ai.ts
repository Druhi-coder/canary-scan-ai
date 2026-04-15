export const generateAIExplanation = async (report: any) => {
  const key = import.meta.env.VITE_OPENAI_API_KEY;

  const prompt = `
You are a medical AI assistant.

Explain this cancer risk report in simple terms:

Pancreatic: ${report.predictions.pancreatic.probability}
Colon: ${report.predictions.colon.probability}
Blood: ${report.predictions.blood.probability}

Top factors: ${report.topFeatures?.join(", ")}

Explain:
- why risk is what it is
- what user should do
Keep it clear, simple, and non-diagnostic.
`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  return data.choices[0].message.content;
};
