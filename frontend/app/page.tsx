import { Header } from "@/components/Header";
import { ParameterPanel } from "@/components/ParameterPanel";
import { PreviewPanel } from "@/components/PreviewPanel";

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0a]">
      <Header />
      <div className="flex flex-1 min-h-0">
        <ParameterPanel />
        <PreviewPanel />
      </div>
    </div>
  );
}
