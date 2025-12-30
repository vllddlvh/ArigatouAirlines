import '../styles/index.css';
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "../contexts/AuthContext";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const isValidAdminPage = router.pathname.startsWith('/admin');
  const isAdminLoginPage = router.pathname === '/admin';

  return (
    <AuthProvider>
      {isValidAdminPage ? 
      ( isAdminLoginPage ? <Component {...pageProps} /> :
        <AdminLayout>
          <Component {...pageProps} />
        </AdminLayout>      
      ) : (
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      )}
      <Toaster />
    </AuthProvider>
  );
}

export default MyApp;
