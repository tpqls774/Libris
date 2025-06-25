"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Star,
  Tag,
  Link as LinkIcon,
  Repeat,
  Trash,
  Plus,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "읽을 예정", color: "#a5b4fc" },
  { value: "읽는 중", color: "#fbbf24" },
  { value: "완독", color: "#10b981" },
];

// 샘플 데이터 (최초 1회 localStorage에 없을 때만 사용)
const sampleBooks = [
  {
    id: 1,
    title: "어린 왕자",
    author: "앙투안 드 생텍쥐페리",
    cover: "/file.svg",
    review: "가장 중요한 것은 눈에 보이지 않아.",
    date: "2024-05-01",
    genre: "소설",
    status: "완독",
    summary:
      "어린 왕자가 여러 행성을 여행하며 만난 어른들의 모습을 통해 삶의 본질과 사랑, 우정의 소중함을 일깨우는 이야기.",
    publisher: "문학동네",
    year: 2015,
    isbn: "978-89-546-3053-9",
    pageCount: 180,
    rating: 4.5,
    quotes: ["가장 중요한 것은 눈에 보이지 않아.", "어른들은 숫자를 좋아해."],
    date: "2024-05-01",
    genre: "소설",
    status: "완독",
    summary:
      "어린 왕자가 여러 행성을 여행하며 만난 어른들의 모습을 통해 삶의 본질과 사랑, 우정의 소중함을 일깨우는 이야기.",
    publisher: "문학동네",
    year: 2015,
    isbn: "978-89-546-3053-9",
    pageCount: 180,
    rating: 4.5,
    quotes: ["가장 중요한 것은 눈에 보이지 않아.", "어른들은 숫자를 좋아해."],
    readPeriod: {
      start: "2024-04-10",
      end: "2024-05-01",
    },
    tags: ["고전", "성장", "인생책"],
    reread: 2,
    goal: "고전 읽기 챌린지",
    links: [
      { label: "출판사 홈페이지", url: "https://www.munhak.com/" },
      { label: "저자 인터뷰", url: "https://example.com/interview" },
    ],
    similar: [
      { id: 3, title: "이방인" },
      { id: 4, title: "연을 쫓는 아이" },
    ],
    statusHistory: [
      { date: "2024-04-10", status: "읽기 시작" },
      { date: "2024-05-01", status: "완독" },
    ],
  },
  {
    id: 2,
    title: "데미안",
    author: "헤르만 헤세",
    cover: "/file.svg",
    review: "새는 알에서 나오려고 투쟁한다.",
    date: "2024-04-15",
    genre: "소설",
    status: "완독",
    summary: "자아를 찾아가는 싱클레어의 성장과 내면의 갈등을 그린 소설.",
    publisher: "민음사",
    year: 2018,
    isbn: "978-89-374-8521-3",
    pageCount: 220,
    rating: 5,
    quotes: [
      "새는 알에서 나오려고 투쟁한다.",
      "네가 반드시 해야 할 일은 네 자신에게로 가는 것이다.",
    ],
    readPeriod: {
      start: "2024-04-01",
      end: "2024-04-15",
    },
    tags: ["성장", "자기계발"],
    reread: 1,
    goal: "추천 받은 책 읽기",
    links: [{ label: "출판사 홈페이지", url: "https://www.minumsa.com/" }],
    similar: [{ id: 5, title: "수레바퀴 아래서" }],
    statusHistory: [
      { date: "2024-04-01", status: "읽기 시작" },
      { date: "2024-04-15", status: "완독" },
    ],
  },
];

function getToday() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function BookDetail() {
  const params = useParams();
  const bookId = Number(params.id);
  const [book, setBook] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // 감상 입력 상태
  const [review, setReview] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  // 인상 깊은 구절 상태
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState("");
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [showQuoteInput, setShowQuoteInput] = useState(false);

  // 별점 상태
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(null);

  // 상태 변경
  const [status, setStatus] = useState("");
  const [statusHistory, setStatusHistory] = useState([]);

  // 읽기 시간 입력 상태
  const [readingTime, setReadingTime] = useState({
    startDate: "",
    endDate: "",
    totalHours: 0,
    totalMinutes: 0
  });
  const [showTimeInput, setShowTimeInput] = useState(false);

  // 실제 데이터 가져오기 (localStorage > 샘플)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let loadedBooks = [];
    const stored = localStorage.getItem("bookshelf_books");
    if (stored) {
      loadedBooks = JSON.parse(stored);
    } else {
      loadedBooks = sampleBooks;
      localStorage.setItem("bookshelf_books", JSON.stringify(sampleBooks));
    }
    const found = loadedBooks.find((b) => Number(b.id) === bookId);
    if (found) {
      setBook(found);
      setReview(found.review || "");
      setQuotes(found.quotes || []);
      setRating(found.rating || 0);
      setStatus(found.status || "읽을 예정");
      setStatusHistory(found.statusHistory || []);
      setReadingTime(found.readingTime || {
        startDate: "",
        endDate: "",
        totalHours: 0,
        totalMinutes: 0
      });
      setEditMode(!found.review);
      setNotFound(false);
    } else {
      setBook(null);
      setNotFound(true);
    }
  }, [bookId]);

  // 별점 저장 (localStorage에 반영)
  function handleSetRating(val) {
    setRating(val);
    if (typeof window !== "undefined" && book) {
      const stored = localStorage.getItem("bookshelf_books");
      let booksData = stored ? JSON.parse(stored) : [];
      booksData = booksData.map((b) =>
        b.id === book.id ? { ...b, rating: val } : b
      );
      localStorage.setItem("bookshelf_books", JSON.stringify(booksData));
      setBook((prev) => (prev ? { ...prev, rating: val } : prev));
    }
  }

  // 상태 변경
  function handleStatusChange(e) {
    const newStatus = e.target.value;
    setStatus(newStatus);

    let newStatusHistory = statusHistory ? [...statusHistory] : [];
    // 같은 날짜+상태 중복 기록 방지
    const today = getToday();
    if (
      !newStatusHistory.some((h) => h.date === today && h.status === newStatus)
    ) {
      newStatusHistory = [
        ...newStatusHistory,
        { date: today, status: newStatus },
      ];
    }
    setStatusHistory(newStatusHistory);

    // localStorage에 반영
    if (typeof window !== "undefined" && book) {
      const stored = localStorage.getItem("bookshelf_books");
      let booksData = stored ? JSON.parse(stored) : [];
      booksData = booksData.map((b) =>
        b.id === book.id
          ? { ...b, status: newStatus, statusHistory: newStatusHistory }
          : b
      );
      localStorage.setItem("bookshelf_books", JSON.stringify(booksData));
      setBook((prev) =>
        prev
          ? { ...prev, status: newStatus, statusHistory: newStatusHistory }
          : prev
      );
    }
  }

  // 감상 저장
  function handleReviewSave(e) {
    e.preventDefault();
    setEditMode(false);
    setSaved(true);

    // localStorage에 반영
    if (typeof window !== "undefined" && book) {
      const stored = localStorage.getItem("bookshelf_books");
      let booksData = stored ? JSON.parse(stored) : [];
      booksData = booksData.map((b) =>
        b.id === book.id ? { ...b, review } : b
      );
      localStorage.setItem("bookshelf_books", JSON.stringify(booksData));
      setBook((prev) => (prev ? { ...prev, review } : prev));
    }
    setTimeout(() => setSaved(false), 2000);
  }

  // 구절 추가
  function handleAddQuote(e) {
    e.preventDefault();
    if (!newQuote.trim()) return;
    const updatedQuotes = [...quotes, newQuote.trim()];
    setQuotes(updatedQuotes);
    setNewQuote("");
    setQuoteSaved(true);

    // localStorage에 반영
    if (typeof window !== "undefined" && book) {
      const stored = localStorage.getItem("bookshelf_books");
      let booksData = stored ? JSON.parse(stored) : [];
      booksData = booksData.map((b) =>
        b.id === book.id ? { ...b, quotes: updatedQuotes } : b
      );
      localStorage.setItem("bookshelf_books", JSON.stringify(booksData));
      setBook((prev) => (prev ? { ...prev, quotes: updatedQuotes } : prev));
    }
    setTimeout(() => setQuoteSaved(false), 1500);
  }

  // 구절 삭제
  function handleDeleteQuote(idx) {
    const updatedQuotes = quotes.filter((_, i) => i !== idx);
    setQuotes(updatedQuotes);

    // localStorage에 반영
    if (typeof window !== "undefined" && book) {
      const stored = localStorage.getItem("bookshelf_books");
      let booksData = stored ? JSON.parse(stored) : [];
      booksData = booksData.map((b) =>
        b.id === book.id ? { ...b, quotes: updatedQuotes } : b
      );
      localStorage.setItem("bookshelf_books", JSON.stringify(booksData));
      setBook((prev) => (prev ? { ...prev, quotes: updatedQuotes } : prev));
    }
  }

  // 읽기 시간 저장
  function handleReadingTimeSave(e) {
    e.preventDefault();
    setShowTimeInput(false);

    // localStorage에 반영
    if (typeof window !== "undefined" && book) {
      const stored = localStorage.getItem("bookshelf_books");
      let booksData = stored ? JSON.parse(stored) : [];
      booksData = booksData.map((b) =>
        b.id === book.id ? { ...b, readingTime } : b
      );
      localStorage.setItem("bookshelf_books", JSON.stringify(booksData));
      setBook((prev) => (prev ? { ...prev, readingTime } : prev));
    }
  }

  if (notFound) {
    return (
      <main className="md:pl-[280px] min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg border border-gray-200">
          해당 도서를 찾을 수 없습니다.
        </div>
      </main>
    );
  }

  if (!book) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          {/* 왼쪽: 책 정보 */}
          <section className="w-full md:w-72 flex flex-col">
            {/* 책 표지 */}
            <div className="aspect-[3/4] relative mb-4 rounded-lg border border-gray-200 overflow-hidden bg-white">
              <Image
                src={book.cover}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>

            {/* 책 기본 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <div className="mb-4">
                <h1 className="text-lg font-medium text-gray-900 mb-1">
                  {book.title}
                </h1>
                <p className="text-sm text-gray-600">{book.author}</p>
              </div>

              {/* 장르와 상태 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200">
                  {book.genre}
                </span>
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="px-2 py-1 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value}
                    </option>
                  ))}
                </select>
              </div>

              {/* 별점 */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleSetRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        (hoverRating || rating) >= n
                          ? "text-yellow-400"
                          : "text-gray-200"
                      }`}
                      fill={
                        (hoverRating || rating) >= n ? "currentColor" : "none"
                      }
                    />
                  </button>
                ))}
                <span className="ml-1.5 text-sm text-gray-600">
                  {rating?.toFixed(1) || "0.0"}
                </span>
              </div>

              {/* 출판 정보 */}
              <div className="space-y-1 text-sm text-gray-600">
                {book.publisher && <p>출판: {book.publisher}</p>}
                {book.year && <p>발행: {book.year}년</p>}
                {book.pageCount && <p>페이지: {book.pageCount}쪽</p>}
                {book.isbn && (
                  <p className="font-mono text-xs">ISBN: {book.isbn}</p>
                )}
              </div>
            </div>

            {/* 태그 */}
            {book.tags && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <h2 className="text-sm font-medium text-gray-900 mb-2">태그</h2>
                <div className="flex flex-wrap gap-1">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-lg border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 읽은 기간 */}
            {book.readPeriod && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <h2 className="text-sm font-medium text-gray-900 mb-2">
                  읽은 기간
                </h2>
                <p className="text-sm text-gray-600">
                  {book.readPeriod.start} ~ {book.readPeriod.end}
                </p>
                {book.reread > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    재독: {book.reread}회
                  </p>
                )}
              </div>
            )}
          </section>

          {/* 오른쪽: 감상과 구절 */}
          <section className="flex-1 space-y-6">
            {/* 책 소개 */}
            {book.summary && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="text-sm font-medium text-gray-900 mb-2">
                  책 소개
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {book.summary}
                </p>
              </div>
            )}

            {/* 감상 */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-900">나의 감상</h2>
                {!editMode && review && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    수정
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleReviewSave}>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="이 책에 대한 생각을 자유롭게 적어보세요."
                    className="w-full h-32 p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                    >
                      저장하기
                    </button>
                  </div>
                </form>
              ) : review ? (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {review}
                </p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-3">
                    아직 감상을 작성하지 않았습니다
                  </p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 text-sm font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                  >
                    감상 작성하기
                  </button>
                </div>
              )}
            </div>

            {/* 인상 깊은 구절 */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-900">
                  인상 깊은 구절
                </h2>
                <button
                  onClick={() => setShowQuoteInput((v) => !v)}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  {showQuoteInput ? "취소" : "구절 추가"}
                </button>
              </div>

              {showQuoteInput && (
                <form onSubmit={handleAddQuote} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQuote}
                      onChange={(e) => setNewQuote(e.target.value)}
                      placeholder="인상 깊었던 구절을 입력하세요"
                      className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-4 h-10 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                    >
                      추가
                    </button>
                  </div>
                </form>
              )}

              {quotes.length > 0 ? (
                <ul className="space-y-3">
                  {quotes.map((quote, idx) => (
                    <li
                      key={idx}
                      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 text-sm text-gray-600">
                        {quote}
                      </div>
                      <button
                        onClick={() => handleDeleteQuote(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-8 text-sm text-gray-400">
                  저장된 구절이 없습니다
                </p>
              )}
            </div>

            {/* 읽기 히스토리 */}
            {statusHistory.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="text-sm font-medium text-gray-900 mb-4">
                  읽기 기록
                </h2>
                <div className="space-y-3">
                  {statusHistory.map((history, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {history.status}
                        </div>
                        <div className="text-xs text-gray-500">
                          {history.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 걸린 시간 */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-900">
                  걸린 시간
                </h2>
                <button
                  onClick={() => setShowTimeInput((v) => !v)}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  {showTimeInput ? "취소" : "시간 입력"}
                </button>
              </div>

              {showTimeInput ? (
                <form onSubmit={handleReadingTimeSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        읽기 시작일
                      </label>
                      <input
                        type="date"
                        value={readingTime.startDate}
                        onChange={(e) => setReadingTime(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        완독일
                      </label>
                      <input
                        type="date"
                        value={readingTime.endDate}
                        onChange={(e) => setReadingTime(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        총 시간 (시간)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={readingTime.totalHours}
                        onChange={(e) => setReadingTime(prev => ({ ...prev, totalHours: parseInt(e.target.value) || 0 }))}
                        className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        총 시간 (분)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={readingTime.totalMinutes}
                        onChange={(e) => setReadingTime(prev => ({ ...prev, totalMinutes: parseInt(e.target.value) || 0 }))}
                        className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                    >
                      저장하기
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  {readingTime.startDate && readingTime.endDate ? (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">기간:</span> {readingTime.startDate} ~ {readingTime.endDate}
                    </div>
                  ) : null}
                  {(readingTime.totalHours > 0 || readingTime.totalMinutes > 0) ? (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">총 시간:</span> {readingTime.totalHours}시간 {readingTime.totalMinutes}분
                    </div>
                  ) : null}
                  {!readingTime.startDate && !readingTime.endDate && readingTime.totalHours === 0 && readingTime.totalMinutes === 0 && (
                    <p className="text-center py-4 text-sm text-gray-400">
                      아직 읽기 시간을 입력하지 않았습니다
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
