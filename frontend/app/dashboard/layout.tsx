import Sidebar from "@/components/dashboard/Sidebar";
import { RouteGuard } from "@/components/dashboard/RouteGuard";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="lg:flex-row md:flex-row flex flex-col justify-between">
      <RouteGuard>
      <Sidebar />
      <MobileSidebar />
      <main className="lg:w-[80%] md:w-[80%] w-full lg:px-10 md:px-6 px-4 h-screen overflow-y-scroll">{children}</main>
      </RouteGuard>
    </div>
  );
};

export default DashboardLayout;