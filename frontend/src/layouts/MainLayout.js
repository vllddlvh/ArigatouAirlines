import Navbar from "../components/navbar";
import Footer from "../components/footer";
import AuthDialog from "../components/AuthDialog";
import ChatbotWidget from "../components/ChatbotWidget";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = ({ children }) => {
  const { isAuthModalOpen, setIsAuthModalOpen, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 to-cyan-800 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
          <span className="text-lg font-semibold">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthDialog 
        open={!isAuthenticated || isAuthModalOpen}
        onOpenChange={(open) => {
          if (!isAuthenticated) return;
          setIsAuthModalOpen(open);
        }}
      />
      <ChatbotWidget />
      {isAuthenticated && (
        <>
          <Navbar />
          {children}
          <Footer />
        </>
      )}
    </>
  );
};

export default MainLayout;
