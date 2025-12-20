import { Sidebar } from "./Sidebar";
import { useState, createContext, useContext } from "react";
import { Button } from "./ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";

interface LayoutContextType {
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  leftSidebarOpen: true,
  setLeftSidebarOpen: () => {},
});

export const useLayout = () => useContext(LayoutContext);

export function ReaderLayout({ children }: { children: React.ReactNode }) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  return (
    <LayoutContext.Provider value={{ leftSidebarOpen, setLeftSidebarOpen }}>
      <div className="flex min-h-screen bg-background text-foreground font-sans">
        {leftSidebarOpen && <Sidebar />}
        
        {!leftSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-2 top-2 z-50 h-8 w-8"
            onClick={() => setLeftSidebarOpen(true)}
            data-testid="button-open-sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}
        
        <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
          {children}
        </main>
      </div>
    </LayoutContext.Provider>
  );
}
