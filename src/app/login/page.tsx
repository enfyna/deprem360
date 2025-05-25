'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Image from 'next/image'; // Next.js Image bileşeni
import { Mail, KeyRound, LogIn, Send, Loader2, Edit3 } from 'lucide-react'; // İkonlar

// Define the Zod schema for the combined form
const CombinedLoginSchema = z.object({
    email: z.string().email({ message: "Geçersiz e-posta adresi." }),
    code: z.string().length(6, { message: "Kod 6 haneli olmalıdır." }).optional().or(z.literal('')), // Code is optional initially, must be 6 chars if present
});

export default function LoginPage() {
    const token = Cookies.get('jwt_token');
    const router = useRouter();

    useEffect(() => { // useEffect içine alındı
        if (token) {
            router.push('/');
        }
    }, [token, router]);

    if (token) {
        return null; // Render nothing while redirecting
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-900 p-4">
            <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800 p-6 border-b dark:border-slate-700">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/loginScreenLogo.png" // public klasöründeki resim
                            alt="Deprem360 Logo"
                            width={100} // İstenilen genişlik
                            height={100} // İstenilen yükseklik
                            className="rounded-full"
                        />
                    </div>
                    <CardTitle className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100">Hoş Geldiniz!</CardTitle>
                    <CardDescription className="text-center text-slate-600 dark:text-slate-400 pt-1">
                        Devam etmek için lütfen giriş yapın.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                    <CombinedLoginForm />
                </CardContent>
            </Card>
            <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} Deprem360. Tüm hakları saklıdır.
            </footer>
        </div>
    );
}

function CombinedLoginForm() {
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof CombinedLoginSchema>>({
        resolver: zodResolver(CombinedLoginSchema),
        defaultValues: {
            email: "",
            code: "",
        },
        mode: "onChange", // Re-validate on change
    });

    async function onSubmit(data: z.infer<typeof CombinedLoginSchema>) {
        setIsLoading(true);
        if (!emailSubmitted) {
            try {
                const res = await fetch("https://engaging-solely-maggot.ngrok-free.app/user/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ login: data.email }),
                });
                const result = await res.json();
                if (res.ok && result?.email !== undefined) {
                    toast({
                        title: "Kod Gönderildi",
                        description: "Lütfen e-postanıza gelen doğrulama kodunu girin.",
                    });
                    setEmailSubmitted(true);
                } else {
                    toast({
                        title: "Geçersiz Kullanıcı",
                        description: result?.message || "E-posta adresi sistemde bulunamadı veya kod gönderilemedi.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Hata",
                    description: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.",
                    variant: "destructive",
                });
            }
        } else {
            if (!data.code) { // Kod boş olamaz
                form.setError("code", { type: "manual", message: "Doğrulama kodu gereklidir." });
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch("https://engaging-solely-maggot.ngrok-free.app/user/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ login: data.email, code: data.code }),
                });
                const result = await res.json();
                if (res.ok && result.token) {
                    toast({
                        title: "Giriş Başarılı!",
                        description: "Yönlendiriliyorsunuz...",
                    });
                    const expiresDate = new Date(result.expiresAt);
                    Cookies.set("jwt_token", result.token, { expires: expiresDate, secure: process.env.NODE_ENV === "production", sameSite: "Lax" });
                    Cookies.set("user_id", result.id, { expires: expiresDate, secure: process.env.NODE_ENV === "production", sameSite: "Lax" });
                    
                    const res2 = await api.get("/user");
                    if (res2.status != 200) {
                        throw new Error("Network response was not ok");
                    }
                    const data = await res2.data;

                    Cookies.set("is_admin", data.isAdmin, { 
                        expires: new Date(result.expiresAt),
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "Lax",
                    });
                    
                    window.location.href = '/dashboard';
                } else {
                    toast({
                        title: "Giriş Başarısız",
                        description: result?.message || "Doğrulama kodu hatalı veya süresi dolmuş.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Hata",
                    description: "Sunucuyla iletişim kurulamadı veya bir hata oluştu.",
                    variant: "destructive",
                });
            }
        }
        setIsLoading(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 dark:text-slate-300">E-posta Adresiniz</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type="email"
                                        placeholder="ornek@eposta.com"
                                        {...field}
                                        disabled={emailSubmitted || isLoading}
                                        className="pl-10 h-12 text-base border-slate-300 dark:border-slate-600 focus:border-sky-500 dark:focus:border-sky-500"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {emailSubmitted && (
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 dark:text-slate-300">Doğrulama Kodu</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <Input
                                            placeholder="● ● ● ● ● ●"
                                            {...field}
                                            maxLength={6}
                                            disabled={isLoading}
                                            className="pl-10 h-12 text-base tracking-[0.3em] border-slate-300 dark:border-slate-600 focus:border-sky-500 dark:focus:border-sky-500"
                                        />
                                    </div>
                                </FormControl>
                                <FormDescription className="text-slate-500 dark:text-slate-400">
                                    E-postanıza gönderilen 6 haneli kodu girin.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" className="w-full h-12 text-lg font-semibold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : emailSubmitted ? (
                        <LogIn className="mr-2 h-5 w-5" />
                    ) : (
                        <Send className="mr-2 h-5 w-5" />
                    )}
                    {isLoading
                        ? 'Lütfen Bekleyin...'
                        : emailSubmitted
                            ? 'Giriş Yap'
                            : 'Kod Gönder'}
                </Button>

                {emailSubmitted && (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => {
                            setEmailSubmitted(false);
                            form.resetField("code");
                        }}
                        disabled={isLoading}
                    >
                        <Edit3 className="mr-2 h-4 w-4" />
                        E-postayı Değiştir
                    </Button>
                )}
            </form>
        </Form>
    );
}
// useEffect import'u eksik, ekleyelim
import { useEffect } from "react";
import api from "@/lib/axios";
