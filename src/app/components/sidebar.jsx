"use client";
import {
  User,
  Clock,
  BookOpen,
  PlusCircle,
  BarChart3,
  Settings,
  BookMarked,
  Notebook,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

// 현재 읽는 중인 책 찾기 (상태 문자열 유연하게 대응)
function findReadingBook(books) {
  const readingKeywords = ["읽는중", "읽는 중", "읽는 중임", "읽고 있음"];
  return books.find(
    (b) =>
      b.status &&
      readingKeywords.some(
        (kw) => b.status.replace(/\s/g, "") === kw.replace(/\s/g, "")
      )
  );
}

export default function Sidebar() {
  const [readingBook, setReadingBook] = useState(null);
  const [now, setNow] = useState("");
  const [nickname, setNickname] = useState("tpqls774");

  // 닉네임 불러오기 및 실시간 반영
  useEffect(() => {
    if (typeof window === "undefined") return;
    setNickname(localStorage.getItem("bookshelf_nickname") || "tpqls774");
    const handleStorage = (e) => {
      if (e.key === "bookshelf_nickname") {
        setNickname(e.newValue || "tpqls774");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // 시계 갱신
  useEffect(() => {
    function updateTime() {
      const d = new Date();
      setNow(
        d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0") +
          " " +
          String(d.getHours()).padStart(2, "0") +
          ":" +
          String(d.getMinutes()).padStart(2, "0") +
          ":" +
          String(d.getSeconds()).padStart(2, "0")
      );
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 책 데이터 불러오기
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("bookshelf_books");
    if (stored) {
      try {
        const books = JSON.parse(stored);
        setReadingBook(findReadingBook(books) || null);
      } catch {
        setReadingBook(null);
      }
    } else {
      setReadingBook(null);
    }
  }, []);

  // 네비게이션 항목 정의
  const navItems = useMemo(
    () => [
      {
        href: "/bookshelf",
        label: "내 책장",
        icon: BookOpen,
        activeColor: "gray",
      },
      {
        href: "/notes",
        label: "노트",
        icon: Notebook,
        activeColor: "emerald",
      },
      {
        href: "/add",
        label: "새 책 추가",
        icon: PlusCircle,
        activeColor: "emerald",
      },
      {
        href: "/stats",
        label: "독서 통계",
        icon: BarChart3,
        activeColor: "gray",
      },
      {
        isDivider: true,
      },
      {
        href: "/settings",
        label: "설정",
        icon: Settings,
        activeColor: "gray",
      },
    ],
    []
  );

  return (
    <aside className="hidden md:flex flex-col w-[280px] bg-white fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] border-r border-gray-100">
      {/* 프로필 */}
      <div className="px-6 py-5 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">@{nickname}</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">{now}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 현재 독서 중인 책 */}
      <div className="p-4 border-y border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative w-[60px] h-[84px] rounded-md bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
            {readingBook && readingBook.cover ? (
              <Image
                src={readingBook.cover}
                alt={readingBook.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <BookMarked className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-1.5">
              <div className="text-xs font-medium text-emerald-600 mb-1">
                현재 읽는 중
              </div>
              <div className="text-sm font-medium text-gray-900 truncate">
                {readingBook ? readingBook.title : "읽고 있는 책이 없습니다"}
              </div>
            </div>
            {readingBook?.author && (
              <div className="text-xs text-gray-500 truncate">
                {readingBook.author}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 p-3">
        <div className="mb-2 px-3">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            메뉴
          </div>
        </div>
        <div className="space-y-1">
          {navItems.map((item, idx) =>
            item.isDivider ? (
              <div key={idx} className="h-px bg-gray-100 my-3" />
            ) : (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center h-10 px-3 rounded-md text-sm font-medium text-gray-700 hover:bg-${
                  item.activeColor === "emerald" ? "emerald-50" : "gray-100"
                } hover:text-${
                  item.activeColor === "emerald" ? "emerald-600" : "gray-900"
                } transition-colors`}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 ${
                    item.activeColor === "emerald"
                      ? "text-gray-400"
                      : "text-gray-400"
                  }`}
                />
                {item.label}
              </a>
            )
          )}
        </div>
      </nav>
    </aside>
  );
}
