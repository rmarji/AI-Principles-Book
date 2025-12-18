import { Sidebar } from "./Sidebar";

export function ReaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
        {children}
      </main>
    </div>
  );
}
