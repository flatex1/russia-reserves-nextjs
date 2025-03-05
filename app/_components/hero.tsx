"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const router = useRouter();

  return (
    <div className="relative h-[600px] flex items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative z-10 text-center text-white max-w-3xl mx-auto px-4">
        <h1 className="text-5xl font-bold mb-6">
          Откройте для себя природные заповедники России
        </h1>
        <p className="text-xl mb-8">
          Исследуйте и защищайте уникальные заповедники нашей страны. Присоединяйтесь к нам в сохранении этих нетронутых природных территорий для будущих поколений.
        </p>
        <Button
          size="lg"
          onClick={() => router.push("/reserves")}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Изучить заповедники
        </Button>
      </div>
    </div>
  );
}