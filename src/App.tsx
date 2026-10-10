import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AuthPage } from "@/pages/AuthPage";
import { NotesApp } from "@/pages/NotesApp";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return user ? <NotesApp /> : <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
