"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import backgroundImage from '@/public/background.webp'; // Путь к изображению фона

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div className="flex flex-col gap-8 w-full h-screen justify-center items-center relative">
      <Image src={backgroundImage} alt="Background" layout="fill" objectFit="cover" className="absolute z-0" />
      <div className="relative z-10 bg-white rounded-lg shadow-lg p-10 w-96">
        <p className="text-lg font-semibold text-center mb-4">Войдите, чтобы увидеть заповедники</p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            void signIn("password", formData)
              .catch((error) => {
                setError(error.message);
              })
              .then(() => {
                router.push("/");
              });
          }}
        >
          <Input
            className="bg-gray-100 text-gray-800 rounded-md p-3"
            type="email"
            name="email"
            placeholder="Электронная почта"
            required
          />
          <Input
            className="bg-gray-100 text-gray-800 rounded-md p-3"
            type="password"
            name="password"
            placeholder="Пароль"
            required
          />
          <Button className="bg-green-600 text-white rounded-md p-3 hover:bg-green-700 transition duration-200">{flow === "signIn" ? "Войти" : "Зарегистрироваться"}</Button>
        </form>
        <div className="flex flex-col gap-2 text-center mx-auto mt-4">
          <span>{flow === "signIn" ? "Нет аккаунта?" : "Уже есть аккаунт?"}</span>
          <span
            className="text-foreground underline hover:no-underline cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Зарегистрироваться вместо этого" : "Войти вместо этого"}
          </span>
        </div>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </div>
    </div>
  );
}
