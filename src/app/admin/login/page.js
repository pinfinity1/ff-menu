"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

import Logo from "@/public/images/icon.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        router.push("/admin/dashboard");
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 sm:p-4">
      <div className="w-full sm:max-w-sm rounded-lg sm:bg-white p-6 sm:shadow-md md:p-8">
        <div className="mb-6 flex flex-col items-center">
          <Image src={Logo} alt="لوگو گرین فست فود" width={80} height={80} />
          <h1 className="mt-4 text-2xl font-bold text-brand-primary-dark">
            ورود به پنل مدیریت
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      className="text-left"
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
                      className="text-left"
                      dir="ltr"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage && (
              <p className="text-sm font-medium text-destructive">
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white bg-brand-primary-dark hover:bg-brand-primary-dark/90 cursor-po"
            >
              {isLoading ? "در حال ورود..." : "ورود"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
