"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { sendBookAddedNotification } from "../../utils/notifications";

// Google Books API 검색 함수
// 사용자가 입력한 쿼리(query)를 이용해 Google Books API에서 책 정보를 검색합니다.
async function searchBooks(query) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=20`
  );
  const data = await res.json();
  return data.items || [];
}

// Empty State 컴포넌트
// 검색 결과가 없거나 로딩 중일 때 보여주는 상태 컴포넌트입니다.
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center flex-1 p-8">
    <Icon className="w-12 h-12 text-gray-300 mb-3" />
    <p className="text-gray-600 font-medium text-lg mb-1">{title}</p>
    <p className="text-gray-400 text-sm text-center">{description}</p>
  </div>
);

// GoogleBookSearch 컴포넌트: 도서 검색 및 추가 기능을 담당합니다.
export default function GoogleBookSearch() {
  // 라우터 객체 (페이지 이동에 사용)
  const router = useRouter();
  // 검색어 상태
  const [search, setSearch] = useState("");
  // 검색 결과로 받아온 책 목록
  const [books, setBooks] = useState([]);
  // 사용자가 선택한 책 정보
  const [selected, setSelected] = useState(null);
  // 책 추가 성공/실패 상태
  const [added, setAdded] = useState(false);
  // 로딩 상태 (검색 중 표시)
  const [loading, setLoading] = useState(false);
  // 페이지 수 수동 입력값 (Google Books에 정보 없을 때)
  const [manualPageCount, setManualPageCount] = useState("");
  // 컴포넌트 마운트 여부 (CSR 환경 체크)
  const [mounted, setMounted] = useState(false);

  // 컴포넌트가 마운트될 때 한 번만 실행 (mounted 플래그 설정)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 검색어가 변경될 때마다 400ms 후 자동 검색 (디바운스)
  // 검색어가 비어있으면 결과 초기화
  useEffect(() => {
    if (!search) {
      setBooks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // 400ms 후 검색 실행 (디바운스)
    const handler = setTimeout(async () => {
      const items = await searchBooks(search);
      setBooks(items);
      setLoading(false);
    }, 400);
    // cleanup: 검색어가 바뀌면 이전 타이머 제거
    return () => clearTimeout(handler);
  }, [search]);

  // 검색 폼 제출 시 수동 검색 실행
  async function handleSearch(e) {
    e.preventDefault();
    setSelected(null);
    setLoading(true);
    const items = await searchBooks(search);
    setBooks(items);
    setLoading(false);
  }

  // 책 목록에서 책을 선택했을 때 실행
  function handleSelect(book) {
    setSelected(book);
    setAdded(false);
    setManualPageCount("");
  }

  // 선택한 책을 내 책장에 추가하는 함수
  function handleAdd(e) {
    e.preventDefault();
    if (!selected) return;
    if (!mounted) return;
    // 브라우저 환경에서만 동작 (SSR 방지)
    if (typeof window !== "undefined") {
      // 기존 책장 데이터 불러오기
      const stored = localStorage.getItem("bookshelf_books");
      const oldBooks = stored ? JSON.parse(stored) : [];

      // Google Books 데이터 → 내 책장 포맷으로 변환
      const info = selected.volumeInfo;
      let pageCount = info.pageCount;
      // 페이지 수 정보가 없으면 수동 입력값 사용
      if (!pageCount) {
        pageCount = Number(manualPageCount) || 0;
      }
      // 새 책의 고유 id 생성 (기존 id 중 최대값 + 1)
      const newId =
        oldBooks.length > 0 ? Math.max(...oldBooks.map((b) => b.id)) + 1 : 1;
      const newBook = {
        id: newId,
        title: info.title || "",
        author: info.authors ? info.authors.join(", ") : "",
        cover: info.imageLinks?.thumbnail || "/file.svg",
        review: "",
        date: new Date().toISOString().slice(0, 10), // 오늘 날짜
        genre: info.categories ? info.categories[0] : "기타",
        status: "읽을 예정",
        pageCount,
      };

      // 이미 추가된 책인지 확인 (제목+저자 중복 방지)
      const already = oldBooks.some(
        (b) => b.title === newBook.title && b.author === newBook.author
      );
      if (already) {
        setAdded("already"); // 이미 추가됨 표시
        setTimeout(() => setAdded(false), 2000);
        return;
      }

      // localStorage에 책장 데이터 저장
      const updated = [...oldBooks, newBook];
      localStorage.setItem("bookshelf_books", JSON.stringify(updated));
      setAdded(true); // 추가 성공 표시
      sendBookAddedNotification(newBook.title); // 알림 전송

      // 1초 후 내 책장 페이지로 이동
      setTimeout(() => {
        setAdded(false);
        router.push("/bookshelf");
      }, 1000);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* 검색 섹션: 도서 검색 입력 및 결과 수 표시 */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-medium text-gray-900">도서 검색</h2>
          </div>
          <form onSubmit={handleSearch} className="relative">
            <input
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg
                focus:outline-none focus:border-emerald-500
                placeholder-gray-400"
              placeholder="제목 또는 저자명으로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Search className="w-4 h-4 text-gray-400" />
            </button>
          </form>
          {search && (
            <p className="mt-2 text-xs text-gray-500">
              {loading ? "검색중..." : `${books.length}건의 검색결과`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 검색 결과 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="h-12 px-5 flex items-center border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">
                  {search ? "검색 결과" : "도서 목록"}
                  {search && !loading && (
                    <span className="ml-2 text-gray-500 text-xs">
                      {books.length}건
                    </span>
                  )}
                </h3>
              </div>

              <div className="min-h-[600px]">
                {loading ? (
                  // 로딩 중 상태 표시
                  <EmptyState
                    icon={Search}
                    title="검색중입니다"
                    description="잠시만 기다려주세요..."
                  />
                ) : books.length > 0 ? (
                  <div className="max-h-[600px] overflow-y-auto">
                    {/* 검색 결과 리스트 렌더링 */}
                    {books.map((item) => {
                      const info = item.volumeInfo;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={`group p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors
                            ${selected?.id === item.id ? "bg-emerald-50" : ""}`}
                        >
                          <div className="flex gap-4">
                            <img
                              src={
                                info.imageLinks?.thumbnail ||
                                "https://via.placeholder.com/80x120?text=No+Cover"
                              }
                              alt={info.title}
                              className="w-[60px] h-[84px] object-cover rounded border border-gray-200 bg-gray-50"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-medium text-gray-900 leading-snug mb-1">
                                {info.title}
                              </h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                {info.authors && (
                                  <p>{info.authors.join(", ")}</p>
                                )}
                                {info.publisher && (
                                  <p className="text-sm text-gray-500">
                                    {info.publisher}
                                    {info.publishedDate
                                      ? ` (${info.publishedDate})`
                                      : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={search ? Search : Search}
                    title={
                      search ? "검색 결과가 없습니다" : "도서를 검색해보세요"
                    }
                    description={
                      search
                        ? "다른 검색어로 다시 시도해보세요."
                        : "제목이나 저자명으로 검색할 수 있습니다."
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* 선택된 책 상세 */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-lg border border-gray-200 min-h-[600px]">
              <div className="h-12 px-5 flex items-center border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">
                  선택된 도서
                </h3>
              </div>

              {selected ? (
                <div className="p-5">
                  <div className="flex flex-col items-center mb-6">
                    <img
                      src={
                        selected.volumeInfo.imageLinks?.thumbnail ||
                        "https://via.placeholder.com/96x128?text=No+Cover"
                      }
                      alt={selected.volumeInfo.title}
                      className="w-[120px] h-[168px] object-cover rounded border border-gray-200 bg-gray-50 mb-4"
                    />
                    <h4 className="text-base font-medium text-gray-900 text-center mb-1">
                      {selected.volumeInfo.title}
                    </h4>
                    <p className="text-sm text-gray-600 text-center">
                      {selected.volumeInfo.authors?.join(", ")}
                    </p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {[
                      ["출판사", selected.volumeInfo.publisher],
                      ["출간일", selected.volumeInfo.publishedDate],
                      ["장르", selected.volumeInfo.categories?.join(", ")],
                      [
                        "ISBN",
                        selected.volumeInfo.industryIdentifiers
                          ?.map((x) => x.identifier)
                          .join(", "),
                      ],
                    ].map(
                      ([label, value]) =>
                        value && (
                          <div
                            key={label}
                            className="flex items-center text-sm"
                          >
                            <span className="w-16 flex-shrink-0 text-gray-500">
                              {label}
                            </span>
                            <span className="text-gray-900">{value}</span>
                          </div>
                        )
                    )}
                    {/* 페이지 수 입력란 */}
                    {!selected.volumeInfo.pageCount ||
                    selected.volumeInfo.pageCount === 0 ? (
                      <div className="flex items-center text-sm">
                        <span className="w-16 flex-shrink-0 text-gray-500">
                          페이지
                        </span>
                        <input
                          type="number"
                          min={1}
                          className="ml-2 w-24 h-8 px-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-emerald-500"
                          placeholder="페이지 수 입력"
                          value={manualPageCount}
                          onChange={(e) => setManualPageCount(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-sm">
                        <span className="w-16 flex-shrink-0 text-gray-500">
                          페이지
                        </span>
                        <span className="text-gray-900">
                          {selected.volumeInfo.pageCount}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={!mounted || added === "already"}
                    className={`w-full h-10 rounded-lg text-sm font-medium transition-colors
                      ${
                        added === "already"
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : added
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                  >
                    {added === true
                      ? "추가 완료!"
                      : added === "already"
                      ? "이미 추가된 도서입니다"
                      : !mounted
                      ? "로딩 중..."
                      : "내 책장에 추가"}
                  </button>
                </div>
              ) : (
                <EmptyState
                  icon={Search}
                  title="도서를 선택해주세요"
                  description={
                    search
                      ? "왼쪽 목록에서 도서를 선택하면 상세 정보가 표시됩니다"
                      : "도서를 검색한 후 선택하면 상세 정보가 표시됩니다"
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
