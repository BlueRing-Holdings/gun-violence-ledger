import CathedralArch from "./CathedralArch";
import Header from "./Header";
import SuiteFooter from "./SuiteFooter";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <CathedralArch position="top" />
      <Header />
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
      <CathedralArch position="bottom" />
      <SuiteFooter />
    </div>
  );
}
