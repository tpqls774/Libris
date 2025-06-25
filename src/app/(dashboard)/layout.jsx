import Header from "@/app/components/header";
import Sidebar from "@/app/components/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="bg-[#f9f9fa] min-h-screen">
      <Header />
      <div>
        <Sidebar />
        <main className="pt-16 md:pl-[280px]">{children}</main>
      </div>
    </div>
  );
}
