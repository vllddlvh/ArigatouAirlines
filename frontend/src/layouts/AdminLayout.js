import AdminNavbar from "@/components/admin/navbar";
import { useAuth } from "../contexts/AuthContext";

const AdminLayout = ({ children }) => {
	const { loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
					<span className="text-lg font-semibold">Đang tải quản trị...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-row relative">
			<div className="fixed top-0">
				<AdminNavbar />
			</div>
			{children}
		</div>
	);
};

export default AdminLayout;
