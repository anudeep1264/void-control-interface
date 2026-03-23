import MatrixRain from "@/components/MatrixRain";
import CyberSidebar from "@/components/CyberSidebar";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="flex h-screen overflow-hidden relative">
      <MatrixRain />
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanline pointer-events-none z-[1]" />
      <CyberSidebar />
      <Dashboard />
    </div>
  );
};

export default Index;
