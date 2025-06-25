"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
import { BookOpen, Library, Search, Filter, Star, Trash2 } from "lucide-react";

// Empty State 컴포넌트
function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <Icon className="w-12 h-12 text-gray-300 mb-3" />
      <p className="text-gray-600 font-medium text-lg mb-1">{title}</p>
      <p className="text-gray-400 text-sm text-center">{description}</p>
    </div>
  );
}

// 별점 표시
function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${
            rating >= n ? "text-amber-500" : "text-gray-300"
          }`}
          fill={rating >= n ? "#f59e0b" : "none"}
        />
      ))}
      <span className="ml-1 text-xs text-amber-500 font-semibold">
        {rating?.toFixed(1) ?? "0.0"}
      </span>
    </div>
  );
}

// 필터 패널
function FilterPanel({
  genreList,
  statusList,
  genreFilter,
  statusFilter,
  onGenreChange,
  onStatusChange,
  onReset,
  onApply,
}) {
  return (
    <div className="mt-3 border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          장르
        </label>
        <select
          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50"
          value={genreFilter}
          onChange={onGenreChange}
        >
          {genreList.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          상태
        </label>
        <select
          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50"
          value={statusFilter}
          onChange={onStatusChange}
        >
          {statusList.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2 flex justify-end gap-2">
        <button
          className="px-4 h-9 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
          onClick={onReset}
          type="button"
        >
          초기화
        </button>
        <button
          className="px-4 h-9 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          onClick={onApply}
          type="button"
        >
          적용
        </button>
      </div>
    </div>
  );
}

// 책 목록 아이템
function BookListItem({ book, onDelete, deleting }) {
  return (
    <div
      className={`group relative hover:bg-gray-50 transition-colors ${
        deleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <Link href={`/bookshelf/${book.id}`} className="block p-4">
        <div className="flex gap-4">
          <div className="w-[72px] h-[96px] relative flex-shrink-0 rounded border border-gray-200 overflow-hidden">
            <Image
              src={book.cover}
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-base font-medium text-gray-900 leading-snug">
                  {book.title}
                </h4>
                <p className="text-sm text-gray-600">{book.author}</p>
              </div>
              <div className="flex flex-col items-end">
                <time className="text-xs text-gray-500">{book.date}</time>
                <button
                  className="mt-2 p-2 rounded-full bg-gray-50 text-gray-400 
                    hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(book.id);
                  }}
                  aria-label="책 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="px-2 h-6 inline-flex items-center text-xs bg-gray-50 text-gray-600 rounded-lg border border-gray-200">
                  {book.genre}
                </span>
                <span className="px-2 h-6 inline-flex items-center text-xs bg-gray-50 text-gray-600 rounded-lg border border-gray-200">
                  {book.status}
                </span>
              </div>
              <RatingStars rating={Number(book.rating) || 0} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Bookshelf() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [filterOpen, setFilterOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [mounted, setMounted] = useState(false);

  // 장르/상태 목록 추출
  const genreList = useMemo(
    () => [
      "전체",
      ...Array.from(new Set(books.map((book) => book.genre).filter(Boolean))),
    ],
    [books]
  );
  const statusList = useMemo(
    () => [
      "전체",
      ...Array.from(new Set(books.map((book) => book.status).filter(Boolean))),
    ],
    [books]
  );

  // 책 데이터 로딩
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bookshelf_books");
      const loadedBooks = stored ? JSON.parse(stored) : [];
      setBooks(loadedBooks);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 검색/필터 적용
  const filteredBooks = useMemo(() => {
    let filtered = books;
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (genreFilter !== "전체") {
      filtered = filtered.filter((book) => book.genre === genreFilter);
    }
    if (statusFilter !== "전체") {
      filtered = filtered.filter((book) => book.status === statusFilter);
    }
    return filtered;
  }, [searchTerm, books, genreFilter, statusFilter]);

  // 올해/이번달 통계
  const now = useMemo(() => new Date(), []);
  const yearStr = useMemo(() => String(now.getFullYear()), [now]);
  const monthStr = useMemo(
    () => yearStr + "-" + String(now.getMonth() + 1).padStart(2, "0"),
    [now, yearStr]
  );
  const thisMonthCount = books.filter((b) =>
    b.date?.startsWith(monthStr)
  ).length;
  const thisYearCount = books.filter((b) => b.date?.startsWith(yearStr)).length;

  // 필터/초기화
  const resetFilters = useCallback(() => {
    setGenreFilter("전체");
    setStatusFilter("전체");
  }, []);

  // 책 삭제
  const handleDelete = useCallback((bookId) => {
    if (!window.confirm("이 책을 책장에서 삭제하시겠습니까?")) return;
    setDeletingId(bookId);
    setTimeout(() => {
      setBooks((prevBooks) => {
        const nextBooks = prevBooks.filter((b) => b.id !== bookId);
        if (typeof window !== "undefined") {
          localStorage.setItem("bookshelf_books", JSON.stringify(nextBooks));
        }
        setDeletingId(null);
        return nextBooks;
      });
    }, 350);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* 검색 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Library className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-medium text-gray-900">도서 검색</h2>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                className="w-full h-10 px-3 border border-gray-200 rounded-lg 
                  text-sm focus:outline-none focus:border-emerald-500
                  placeholder-gray-400"
                placeholder="책 제목 또는 저자명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              className={`px-3 h-10 border rounded-lg flex items-center gap-2 transition-colors
                ${
                  genreFilter !== "전체" || statusFilter !== "전체"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              onClick={() => setFilterOpen((v) => !v)}
              type="button"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">필터</span>
              {(genreFilter !== "전체" || statusFilter !== "전체") && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
          {filterOpen && (
            <FilterPanel
              genreList={genreList}
              statusList={statusList}
              genreFilter={genreFilter}
              statusFilter={statusFilter}
              onGenreChange={(e) => setGenreFilter(e.target.value)}
              onStatusChange={(e) => setStatusFilter(e.target.value)}
              onReset={resetFilters}
              onApply={() => setFilterOpen(false)}
            />
          )}
        </div>

        {mounted ? (
          <>
            {/* 통계 섹션 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <SummaryCard label="전체 도서" value={books.length} />
              <SummaryCard label="이번 달" value={thisMonthCount} />
              <SummaryCard label="올해" value={thisYearCount} />
            </div>

            {/* 책 목록 */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 h-14 flex items-center justify-between border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    내 책 목록
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchTerm ||
                    genreFilter !== "전체" ||
                    statusFilter !== "전체"
                      ? `검색결과 ${filteredBooks.length}권`
                      : `전체 ${books.length}권`}
                  </p>
                </div>
              </div>
              {filteredBooks.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredBooks.map((book) => (
                    <BookListItem
                      key={book.id}
                      book={book}
                      onDelete={handleDelete}
                      deleting={deletingId === book.id}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title={
                    searchTerm ||
                    genreFilter !== "전체" ||
                    statusFilter !== "전체"
                      ? "검색 결과가 없습니다"
                      : "아직 추가된 책이 없습니다"
                  }
                  description={
                    searchTerm ||
                    genreFilter !== "전체" ||
                    statusFilter !== "전체"
                      ? "다른 검색어나 필터를 시도해보세요"
                      : "새로운 책을 추가해보세요"
                  }
                />
              )}
            </div>
            {/* 페이지네이션 (예시) */}
            {filteredBooks.length > 20 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex gap-2">
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      className={`
                        w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium
                        ${
                          page === 1
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        }
                      `}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400 py-12">로딩 중...</div>
        )}
      </div>
    </main>
  );
}

// 통계 카드
function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-medium text-gray-900">{value}권</div>
    </div>
  );
}
