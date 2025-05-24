'use client'

import { Card } from "@/components/ui/card";
import { useState } from "react"; // Added useState
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
import Cookies from "js-cookie"; // Import js-cookie

// Define the Zod schema for the combined form
const CombinedLoginSchema = z.object({
    email: z.string().email({ message: "Geçersiz e-posta adresi." }),
    code: z.string().optional(), // Code is optional initially
});

export default function LoginPage() {
    // Redirect if already logged in
    const token = Cookies.get('jwt_token');
    const router = useRouter();
    if (token) {
        router.push('/'); // or '/dashboard'
        return null; // Render nothing while redirecting
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center py-8 px-4 bg-gray-100 dark:bg-gray-900">
            <Card className="p-8 w-full max-w-md shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Giriş Yap</h2>
                <CombinedLoginForm />
            </Card>
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
        // Re-validate on change for better UX
        mode: "onChange",
    });

    async function onSubmit(data: z.infer<typeof CombinedLoginSchema>) {
        setIsLoading(true);
        if (!emailSubmitted) {
            // Step 1: Submit email to get code
            try {
                const res = await fetch("https://engaging-solely-maggot.ngrok-free.app/user/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        login: data.email,
                    }),
                });

                const result = await res.json();
                console.log("Email submission API response:", result); // Added for debugging
                if (res.ok && result?.email != undefined) {
                    toast({
                        title: "Kod Gönderildi",
                        description: "Lütfen e-postanıza gelen doğrulama kodunu girin.",
                    });
                    setEmailSubmitted(true);
                } else {
                    toast({
                        title: "Geçersiz Kullanıcı",
                        description: "E-posta adresi sistemde bulunamadı veya kod gönderilemedi.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Email submission error:", error);
                toast({
                    title: "Hata",
                    description: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.",
                    variant: "destructive",
                });
            }
        } else {
            // Step 2: Submit email and code to login
            if (!data.code || data.code.length !== 6) {
                form.setError("code", { type: "manual", message: "Kod 6 haneli olmalıdır." });
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch("https://engaging-solely-maggot.ngrok-free.app/user/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        login: data.email,
                        code: data.code,
                    }),
                });

                const result = await res.json();
                if (res.ok && result.token) {
                    toast({
                        title: "Giriş Başarılı!",
                        description: "Yönlendiriliyorsunuz...",
                    });
                    Cookies.set("jwt_token", result.token, {
                        expires: new Date(result.expiresAt),
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "Lax",
                    });
                    Cookies.set("user_id", result.id, { // Assuming 'id' is part of the response
                        expires: new Date(result.expiresAt),
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "Lax",
                    });
                    // router.push('/dashboard'); // Or use window.location.href if issues with router cache
                    window.location.href = '/dashboard';
                } else {
                    toast({
                        title: "Giriş Başarısız",
                        description: "Kullanıcı adı veya şifre hatalı.", // Updated error message
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Login with code error:", error);
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
                            <FormLabel>E-posta</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="E-posta adresinizi girin"
                                    {...field}
                                    disabled={emailSubmitted || isLoading}
                                />
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
                                <FormLabel>Doğrulama Kodu</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="6 haneli kodu girin"
                                        {...field}
                                        maxLength={6}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormDescription>
                                    E-postanıza gönderilen 6 haneli kodu girin.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                        ? 'Yükleniyor...'
                        : emailSubmitted
                            ? 'Giriş Yap'
                            : 'Doğrulama Kodu Gönder'}
                </Button>

                {emailSubmitted && (
                    <Button
                        type="button"
                        variant="link"
                        className="w-full mt-2"
                        onClick={() => {
                            setEmailSubmitted(false);
                            form.resetField("code"); // Clear the code field
                            // Optionally, allow email to be editable again if needed
                        }}
                        disabled={isLoading}
                    >
                        E-postayı Değiştir
                    </Button>
                )}
            </form>
        </Form>
    );
}
