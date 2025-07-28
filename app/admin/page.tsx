import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard";
import Header from "@/components/header";
import Footer from "@/components/footer";

const AdminPage = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/admin");
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome back, {session.user.username || session.user.name}
        </p>
        
        <AdminDashboard />
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
