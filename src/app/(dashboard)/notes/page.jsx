"use client"

import { useState, useEffect } from "react";
import { BookOpen, Search, Filter, Star, Trash2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("전체");
  const [ratingFilter, setRatingFilter] = useState("전체");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // 필터 옵션
  const dateOptions = ["전체", "이번 달", "지난 달", "올해"];
  const ratingOptions = ["전체", "5점", "4점", "3점", "2점", "1점"];

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 책 데이터에서 review가 있는 책만 notes로 가공
      const storedBooks = localStorage.getItem("bookshelf_books");
      let notesFromBooks = [];
      if (storedBooks) {
        notesFromBooks = JSON.parse(storedBooks)
          .filter(b => b.review && b.review.trim())
          .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
          .map(b => ({
            id: b.id,
            title: b.title,
            date: b.date,
            content: b.review,
            rating: b.rating,
            cover: b.cover,
            author: b.author,
          }));
      }
      setNotes(notesFromBooks);
      setFilteredNotes(notesFromBooks);
      setBooks(storedBooks ? JSON.parse(storedBooks) : []);
    }
  }, []);

  // 검색어와 필터 적용
  useEffect(() => {
    let filtered = notes;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 날짜 필터링
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    if (dateFilter === "이번 달") {
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate.getFullYear() === thisYear &&
               noteDate.getMonth() === thisMonth;
      });
    } else if (dateFilter === "지난 달") {
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.date);
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        return noteDate.getFullYear() === lastMonthYear &&
               noteDate.getMonth() === lastMonth;
      });
    } else if (dateFilter === "올해") {
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate.getFullYear() === thisYear;
      });
    }

    // 별점 필터링
    if (ratingFilter !== "전체") {
      const rating = Number(ratingFilter.replace("점", ""));
      filtered = filtered.filter(note => {
        return Number(note.rating) === rating;
      });
    }

    setFilteredNotes(filtered);
  }, [searchTerm, dateFilter, ratingFilter, notes, books]);

  // 노트 삭제
  function handleDelete(noteId) {
    if (!window.confirm("이 감상을 삭제하시겠습니까?")) return;

    setDeletingId(noteId);
    setTimeout(() => {
      const nextNotes = notes.filter(n => n.id !== noteId);
      setNotes(nextNotes);

      // books에서 해당 리뷰도 삭제
      const nextBooks = books.map(b =>
        b.id === noteId ? { ...b, review: "" } : b
      );

      if (typeof window !== "undefined") {
        // notes는 별도 보관하지 않고 books의 review에서 파생되므로 notes는 저장 X
        localStorage.setItem("bookshelf_books", JSON.stringify(nextBooks));
      }
      setBooks(nextBooks);
      setFilteredNotes(nextNotes);
      setDeletingId(null);
    }, 300);
  }

  // 별점 렌더링
  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${rating >= n ? "text-yellow-400" : "text-gray-200"}`}
          fill={rating >= n ? "currentColor" : "none"}
        />
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* 검색 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-medium text-gray-900">독서 감상 목록</h2>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg
                  focus:outline-none focus:border-emerald-500 pr-10"
                placeholder="제목이나 내용으로 검색"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={`px-3 h-10 border rounded-lg flex items-center gap-2 transition-colors
                ${dateFilter !== "전체" || ratingFilter !== "전체"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">필터</span>
              {(dateFilter !== "전체" || ratingFilter !== "전체") && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          {/* 필터 패널 */}
          {filterOpen && (
            <div className="mt-3 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">기간</label>
                  <select
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                  >
                    {dateOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">별점</label>
                  <select
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50"
                    value={ratingFilter}
                    onChange={e => setRatingFilter(e.target.value)}
                  >
                    {ratingOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setDateFilter("전체");
                    setRatingFilter("전체");
                  }}
                  className="px-4 h-9 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  초기화
                </button>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="px-4 h-9 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  적용
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 감상 목록 */}
        <div className="space-y-4">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div
                key={note.id}
                className={`group bg-white rounded-lg border border-gray-200 p-5 transition-opacity
                  ${deletingId === note.id ? "opacity-50" : ""}`}
              >
                <div className="flex gap-4">
                  {/* 책 표지 */}
                  <div className="w-[72px] h-[96px] relative flex-shrink-0">
                    <Image
                      src={note.cover || "/file.svg"}
                      alt={note.title}
                      fill
                      className="object-cover rounded border border-gray-200"
                    />
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <Link
                          href={`/bookshelf/${note.id}`}
                          className="text-base font-medium text-gray-900 hover:text-emerald-600"
                        >
                          {note.title}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">
                          {note.author}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500">{note.date}</div>
                        {note.rating && renderStars(note.rating)}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {note.content}
                    </p>

                    <div className="mt-3 flex justify-between items-center">
                      <Link
                        href={`/notes/coach?id=${note.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1 text-xs text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-50 transition"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI 코치
                      </Link>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-full 
                          hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="text-base font-medium text-gray-600 mb-1">
                  {searchTerm || dateFilter !== "전체" || ratingFilter !== "전체"
                    ? "검색 결과가 없습니다"
                    : "아직 작성한 감상이 없습니다"}
                </h3>
                <p className="text-sm text-gray-500">
                  {searchTerm || dateFilter !== "전체" || ratingFilter !== "전체"
                    ? "다른 검색어나 필터를 시도해보세요"
                    : "책을 읽고 첫 감상을 남겨보세요!"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}