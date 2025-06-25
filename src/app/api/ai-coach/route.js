// Next.js App Router API Route (Edge 또는 Node)
// GPT-3.5/4 API 활용, 응답 포맷: { comment, question, suggestion, related }

export const runtime = "edge"; // or 'nodejs' (edge가 더 빠름)

export async function POST(req) {
  try {
    const { content } = await req.json();
    if (!content) {
      return new Response(JSON.stringify({ error: "감상문이 필요합니다." }), { status: 400 });
    }
    const prompt = `
다음은 사용자가 쓴 독서 감상문입니다.

---
${content}
---

아래 항목을 한국어로 JSON 형태로 만들어서 응답해 주세요.

1. comment: 감상문에 대한 긍정적 코멘트(칭찬, 요약, 특징 등)
2. question: 감상을 더 깊게 할 수 있는 확장 질문 1개
3. suggestion: 감상문을 더 잘 쓰기 위한 짧은 피드백(글쓰기 팁, 구체적 조언 등)
4. related: 비슷한 책이나 키워드, 혹은 연관 주제 2~3개(책 제목, 키워드 등 자유롭게)

예시:
{
  "comment": "...",
  "question": "...",
  "suggestion": "...",
  "related": ["...", "..."]
}
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "당신은 독서 감상문 피드백을 잘하는 친절한 코치입니다." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiRes.ok) {
      return new Response(JSON.stringify({ error: "OpenAI API 오류" }), { status: 500 });
    }
    const openaiData = await openaiRes.json();
    // GPT 응답에서 JSON 추출
    const gptText = openaiData.choices?.[0]?.message?.content?.trim() ?? "";
    let json = null;
    try {
      // code block 있을 경우 제거
      const match = gptText.match(/```(?:json)?([\s\S]*?)```/);
      const jsonStr = match ? match[1] : gptText;
      json = JSON.parse(jsonStr);
    } catch (e) {
      // fallback: 괄호 부분 추출
      try {
        const j = gptText.slice(gptText.indexOf("{"), gptText.lastIndexOf("}") + 1);
        json = JSON.parse(j);
      } catch {
        return new Response(JSON.stringify({ error: "AI 응답 파싱 실패", raw: gptText }), { status: 500 });
      }
    }
    return new Response(JSON.stringify(json), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "서버 오류" }), { status: 500 });
  }
} 