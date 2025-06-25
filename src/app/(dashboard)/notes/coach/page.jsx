"use client"

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowLeft, BookOpen, MessageSquare, Lightbulb, Compass } from "lucide-react";
import Link from "next/link";

function NoteCoachContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const noteId = searchParams.get("id");
  const [note, setNote] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 노트 데이터 로드
  useEffect(() => {
    if (!noteId) return;
    if (typeof window !== "undefined") {
      const books = JSON.parse(localStorage.getItem("bookshelf_books") || "[]");
      const found = books.find(b => String(b.id) === String(noteId) && b.review && b.review.trim());
      if (!found) {
        setError("감상문을 찾을 수 없습니다.");
        return;
      }
      setNote({
        id: found.id,
        title: found.title,
        date: found.date,
        content: found.review,
        rating: found.rating,
        author: found.author,
      });
    }
  }, [noteId]);

  // AI 분석 요청
  async function handleCoachRequest() {
    if (!note?.content) return;
    setLoading(true);
    setError("");
    setAiFeedback(null);

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note.content }),
      });
      if (!res.ok) throw new Error("AI 코치 응답 오류");
      const data = await res.json();
      setAiFeedback(data);
    } catch (e) {
      setError("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
    setLoading(false);
  }

  if (!noteId) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">감상문 ID가 필요합니다.</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-medium text-gray-900">독서 감상 AI 분석</h2>
          </div>
          
          <div className="flex gap-2">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4" />
              감상 목록으로 돌아가기
            </Link>
          </div>
        </div>

        {/* 감상문 내용 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-lg font-medium text-gray-900">{note.title}</h1>
              <div className="text-sm text-gray-500 mt-1">{note.author}</div>
            </div>
            <div className="text-sm text-gray-500">{note.date}</div>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</p>
        </div>

        {/* AI 코치 분석 섹션 */}
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-medium text-emerald-700">
              AI 독서 감상 코치
            </h2>
          </div>

          {!aiFeedback && !loading && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                AI가 당신의 감상문을 분석하여 더 깊이 있는 독서 경험을 위한 피드백을 제공합니다.
              </p>
              <button
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                onClick={handleCoachRequest}
              >
                감상문 AI 분석 시작
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-emerald-600 p-8 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI가 감상문을 분석하고 있습니다...</span>
            </div>
          )}

          {aiFeedback && (
            <div className="space-y-4">
              {/* AI 코멘트 */}
              <div className="bg-white rounded-lg border border-emerald-200 p-4">
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">AI 코멘트</span>
                </div>
                <p className="text-sm text-gray-600">{aiFeedback.comment}</p>
              </div>

              {/* 확장 질문 */}
              <div className="bg-white rounded-lg border border-emerald-200 p-4">
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                  <Lightbulb className="w-4 h-4" />
                  <span className="font-medium">생각해볼 질문</span>
                </div>
                <p className="text-sm text-gray-600">{aiFeedback.question}</p>
              </div>

              {/* 글쓰기 팁 */}
              <div className="bg-white rounded-lg border border-emerald-200 p-4">
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                  <Compass className="w-4 h-4" />
                  <span className="font-medium">더 나은 감상문을 위한 팁</span>
                </div>
                <p className="text-sm text-gray-600">{aiFeedback.suggestion}</p>
              </div>

              {/* 관련 추천 */}
              {aiFeedback.related && (
                <div className="bg-white rounded-lg border border-emerald-200 p-4">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">관련 도서 및 키워드</span>
                  </div>
                  <ul className="list-disc ml-5 text-sm text-gray-600">
                    {aiFeedback.related.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setAiFeedback(null)}
                className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                다시 분석하기
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// 로딩 컴포넌트
function LoadingFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
    </main>
  );
}

export default function NoteCoachPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NoteCoachContent />
    </Suspense>
  );
}