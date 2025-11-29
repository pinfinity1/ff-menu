"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
// import Logo from "@/public/images/icon.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(1, { message: "نام کاربری الزامی است." }),
  password: z.string().min(1, { message: "رمز عبور الزامی است." }),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // استفاده از window.location برای رفرش کامل و دریافت سشن جدید
        window.location.href = "/admin/dashboard";
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "خطایی رخ داد.");
      }
    } catch (error) {
      setErrorMessage("خطا در برقراری ارتباط با سرور.");
    }
    setIsLoading(false);
  }

  return (
    // پس‌زمینه پترن‌دار مشابه سایت اصلی
    <div
      className="flex min-h-screen items-center justify-center bg-gray-50 font-picoopic"
      style={{
        backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="w-full max-w-md p-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
          {/* لوگو و عنوان */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 relative mb-4 rounded-full overflow-hidden">
              <Image
                src={"/images/icon.png"}
                alt="لوگو"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              ورود به پنل مدیریت
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              لطفا نام کاربری و رمز عبور خود را وارد کنید
            </p>
          </div>

          {/* فرم ورود */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام کاربری</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin"
                        {...field}
                        className="text-left ltr bg-white"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="text-left ltr bg-white"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errorMessage && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 text-center">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base bg-brand-primary hover:bg-brand-primary-dark transition-colors shadow-md shadow-brand-primary/20"
              >
                {isLoading ? "در حال بررسی..." : "ورود به سیستم"}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © ۲۰۲۴ گرین فست‌فود. تمامی حقوق محفوظ است.
        </p>
      </div>
    </div>
  );
}
