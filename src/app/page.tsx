import Image from "next/image";
import logoImg from "@/assets/images/logo/white_bookr_logo.png";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-900 font-sans p-4 text-center">
      <div className="flex flex-col items-center justify-center gap-8 max-w-lg">
        <div className="border-b-4 border-[#63A1FD] pb-6 mb-2">
          <Image
            src={logoImg}
            alt="Bookr Logo"
            width={200}
            height={60}
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          <span className="text-[#63A1FD]">Coming Soon</span>
        </h1>
      </div>
    </div>
  );
}
