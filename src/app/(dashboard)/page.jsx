"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Target, Bookmark, CalendarDays } from "lucide-react";

// 오늘의 추천 도서 seed 기반 랜덤 함수
function seededRandom(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 오늘의 추천 도서 커스텀 훅
function useTodayBook() {
  const [todayBook, setTodayBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const keywords = [
      "베스트셀러",
      "소설",
      "과학",
      "역사",
      "철학",
      "문학",
      "여행",
      "예술",
      "기술",
      "심리",
    ];
    const now = new Date();
    const seed = Number(
      now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0")
    );
    const keywordIdx = Math.floor(seededRandom(seed) * keywords.length);
    const todayKeyword = keywords[keywordIdx];

    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        todayKeyword
      )}&maxResults=20&langRestrict=ko`
    )
      .then((res) => res.json())
      .then((data) => {
        const koreanBooks = (data.items || []).filter((item) => {
          const v = item.volumeInfo;
          return (
            /[가-힣]/.test(v.title || "") ||
            (v.authors && v.authors.some((a) => /[가-힣]/.test(a))) ||
            /[가-힣]/.test(v.publisher || "")
          );
        });
        koreanBooks.sort((a, b) => {
          const tA = a.volumeInfo.title || "";
          const tB = b.volumeInfo.title || "";
          return tA.localeCompare(tB);
        });
        if (koreanBooks.length > 0) {
          const bookIdx = Math.floor(
            seededRandom(seed + 1) * koreanBooks.length
          );
          const v = koreanBooks[bookIdx].volumeInfo;
          setTodayBook({
            title: v.title || "제목 없음",
            author: (v.authors && v.authors.join(", ")) || "저자 미상",
            cover:
              (v.imageLinks &&
                (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) ||
              "/book-cover.jpg",
            quote: v.description
              ? v.description.slice(0, 60) +
                (v.description.length > 60 ? "..." : "")
              : "Google Books에서 추천하는 책입니다!",
          });
        } else {
          setTodayBook({
            title: "코스모스",
            author: "칼 세이건",
            cover: "/book-cover.jpg",
            quote: "우주는 우리 안에 있다. 우리는 별의 먼지로 만들어졌다.",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setTodayBook({
          title: "코스모스",
          author: "칼 세이건",
          cover: "/book-cover.jpg",
          quote: "우주는 우리 안에 있다. 우리는 별의 먼지로 만들어졌다.",
        });
        setLoading(false);
      });
  }, []);

  return { todayBook, loading };
}

// 독서 관련 정보 훅
function useBookshelfStats(todayBook) {
  const [monthlyBooks, setMonthlyBooks] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(15);
  const [annualBooks, setAnnualBooks] = useState(0);
  const [annualGoal, setAnnualGoal] = useState(50);
  const [notesCount, setNotesCount] = useState(0);
  const [lastNoteDate, setLastNoteDate] = useState("");
  const [recentNotes, setRecentNotes] = useState([]);
  const [alreadyAdded, setAlreadyAdded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMonthlyGoal(Number(localStorage.getItem("bookshelf_monthlyGoal")) || 15);
    setAnnualGoal(Number(localStorage.getItem("bookshelf_yearlyGoal")) || 50);

    const storedBooks = localStorage.getItem("bookshelf_books");
    let books = [];
    if (storedBooks) {
      books = JSON.parse(storedBooks);
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      setMonthlyBooks(
        books.filter(
          (b) => b.date && b.date.startsWith(`${y}-${m}`) && b.status === "완독"
        ).length
      );
      setAnnualBooks(
        books.filter(
          (b) => b.date && b.date.startsWith(`${y}`) && b.status === "완독"
        ).length
      );
      // 최근 독서 노트
      const reviewNotes = books
        .filter((b) => b.review && b.review.trim())
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
        .slice(0, 3)
        .map((b) => ({
          title: b.title,
          date: b.date,
          content: b.review,
        }));
      setNotesCount(reviewNotes.length);
      setRecentNotes(reviewNotes);
      setLastNoteDate(reviewNotes[0]?.date || "");
      // 오늘의 추천 도서 책장 포함 여부
      if (todayBook) {
        setAlreadyAdded(
          books.some(
            (b) => b.title === todayBook.title && b.author === todayBook.author
          )
        );
      }
    }
  }, [todayBook]);

  return {
    monthlyBooks,
    monthlyGoal,
    annualBooks,
    annualGoal,
    notesCount,
    lastNoteDate,
    recentNotes,
    alreadyAdded,
  };
}

// 현황 카드 컴포넌트
function StatusCard({ icon, title, current, goal }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-medium text-gray-900">{title}</h2>
      </div>
      <div className="flex items-baseline gap-1">
        <div className="text-2xl font-semibold text-gray-900">{current}</div>
        <div className="text-sm text-gray-500">/ {goal}권</div>
      </div>
      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min((current / goal) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

// 최근 독서 노트 카드
function NotePreview({ note }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900">{note.title}</h3>
        <time className="text-xs text-gray-500">{note.date}</time>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
    </div>
  );
}

export default function Home() {
  const username = "tpqls774";
  const [addLoading, setAddLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showResetToast, setShowResetToast] = useState(false);

  const { todayBook, loading } = useTodayBook();
  const {
    monthlyBooks,
    monthlyGoal,
    annualBooks,
    annualGoal,
    notesCount,
    lastNoteDate,
    recentNotes,
    alreadyAdded,
  } = useBookshelfStats(todayBook);

  useEffect(() => {
    setMounted(true);
    // 계정 초기화 안내 메시지
    if (typeof window !== "undefined" && localStorage.getItem("libris_reset")) {
      setShowResetToast(true);
      localStorage.removeItem("libris_reset");
      setTimeout(() => setShowResetToast(false), 3000);
    }
  }, []);

  // 오늘의 추천 도서 책장에 추가
  const handleAddTodayBook = useCallback(() => {
    if (typeof window === "undefined" || !todayBook) return;
    setAddLoading(true);
    const storedBooks = localStorage.getItem("bookshelf_books");
    let books = [];
    if (storedBooks) {
      books = JSON.parse(storedBooks);
    }
    const exists = books.some(
      (b) => b.title === todayBook.title && b.author === todayBook.author
    );
    if (exists) {
      alert("이미 책장에 추가된 책입니다.");
      setAddLoading(false);
      return;
    }
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
    const newBook = {
      title: todayBook.title,
      author: todayBook.author,
      cover: todayBook.cover,
      date,
      status: "읽는중",
      review: "",
    };
    books.unshift(newBook);
    localStorage.setItem("bookshelf_books", JSON.stringify(books));
    alert("책장에 추가되었습니다!");
    setAddLoading(false);
  }, [todayBook]);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8 lg:p-12">
      {/* 환영 메시지 */}
      <section className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium text-gray-900">
          안녕하세요,
          <br className="md:hidden" />
          <span className="text-emerald-600">{username}</span>님
        </h1>
      </section>

      {/* 독서 현황 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard
          icon={<CalendarDays className="w-5 h-5 text-gray-400" />}
          title="이번 달 독서"
          current={monthlyBooks}
          goal={monthlyGoal}
        />
        <StatusCard
          icon={<Target className="w-5 h-5 text-gray-400" />}
          title="연간 목표"
          current={annualBooks}
          goal={annualGoal}
        />
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="w-5 h-5 text-gray-400" />
            <h2 className="text-sm font-medium text-gray-900">독서 노트</h2>
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {notesCount}개
          </div>
          <p className="text-sm text-gray-500 mt-1">
            마지막 기록: {lastNoteDate || "-"}
          </p>
        </div>
      </div>

      {/* 오늘의 추천 도서 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            오늘의 추천 도서
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-48 bg-white rounded-lg border border-gray-200">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          mounted &&
          todayBook && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex gap-5">
                <div className="relative w-24 h-36 md:w-32 md:h-48 flex-shrink-0">
                  <Image
                    src={todayBook.cover}
                    alt={todayBook.title}
                    fill
                    className="object-cover rounded-md shadow-sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {todayBook.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {todayBook.author}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {todayBook.quote}
                  </p>
                  <button
                    className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition disabled:opacity-50"
                    onClick={handleAddTodayBook}
                    disabled={addLoading || alreadyAdded}
                  >
                    {alreadyAdded
                      ? "이미 추가됨"
                      : addLoading
                      ? "추가 중..."
                      : "책장에 추가"}
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </section>

      {/* 최근 독서 노트 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">최근 독서 노트</h2>
          <Link
            href="/notes"
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            전체보기
          </Link>
        </div>
        <div className="space-y-3">
          {recentNotes.length > 0 ? (
            recentNotes.map((note, idx) => (
              <NotePreview key={idx} note={note} />
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">아직 작성한 독서 노트가 없습니다</p>
              <Link
                href="/add"
                className="inline-block mt-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                첫 독서 노트 작성하기 →
              </Link>
            </div>
          )}
        </div>
      </section>

      {showResetToast && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-center font-medium">
          계정 데이터가 초기화되었습니다.
        </div>
      )}
    </main>
  );
}
