'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast'; // Assuming you have a toast component
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Cookies from 'js-cookie'; // Import js-cookie

// ---
// Main LoginPage Component
// ---
export default function LoginPage() {
    const router = useRouter();
    const token = Cookies.get('jwt_token');

    // If a token exists, redirect to dashboard immediately
    if (token) {
        router.push('/dashboard');
        return null; // Don't render anything if redirecting
    }

    return (
        <div className="w-100 min-h-screen flex items-center justify-center">
            <Card className="p-8">
                <LoginForm />
            </Card>
        </div>
    );
}

// ---
// Zod Schema for Form Validation
// We use a single schema that includes all fields for the combined form.
// ---
const LoginFormSchema = z.object({
    email: z.string().email({ message: 'Geçersiz e-posta adresi.' }),
    code: z.string().max(6, 'Kod 6 karakterli olmalı.').min(6, 'Kod 6 karakterli olmalı.').optional(), // Code is optional for the first step
});

// ---
// LoginForm Component (handles both steps)
// ---
function LoginForm() {
    const [step, setStep] = useState(1); // 1 for email, 2 for code
    const router = useRouter();

    // Use a single form instance that includes all possible fields for both steps
    const form = useForm<z.infer<typeof LoginFormSchema>>({
        resolver: zodResolver(LoginFormSchema), // Use the combined schema
        defaultValues: {
            email: '',
            code: '',
        },
        mode: 'onChange', // Validate as the user types
    });

    // ---
    // Handle Form Submission (Combines logic for both steps)
    // ---
    async function onSubmit(data: z.infer<typeof LoginFormSchema>) {
        if (step === 1) {
            // Logic for email submission
            try {
                const res = await fetch('https://engaging-solely-maggot.ngrok-free.app/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        login: data.email,
                    }),
                });

                const result = await res.json();
                if (res.ok && result.email !== undefined) {
                    console.log('Email başarılı:', result);
                    // Pre-fill the email in the form context for the next step
                    form.setValue('email', data.email);
                    setStep(2);
                    toast({
                        title: 'E-posta gönderildi',
                        description: 'Giriş kodunuz e-posta adresinize gönderildi.',
                    });
                } else {
                    console.error('Giriş başarısız:', result || 'Bilinmeyen hata');
                    toast({
                        title: 'Giriş Başarısız',
                        description: result.error || 'Beklenmeyen bir hata oluştu.',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Ağ hatası veya beklenmeyen sorun:', error);
                toast({
                    title: 'Hata',
                    description: 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.',
                    variant: 'destructive',
                });
            }
        } else if (step === 2) {
            // Validate code only if in step 2
            const codeValidationResult = LoginFormSchema.pick({ code: true }).safeParse({ code: data.code });
            if (!codeValidationResult.success) {
                // If code validation fails, update form state and prevent submission
                codeValidationResult.error.errors.forEach(err => {
                    form.setError('code', { type: 'manual', message: err.message });
                });
                return;
            }

            // Logic for code submission
            try {
                const res = await fetch('https://engaging-solely-maggot.ngrok-free.app/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        login: data.email,
                        code: data.code,
                    }),
                });

                const result = await res.json();
                if (res.ok && result.token !== undefined) {
                    console.log('Giriş başarılı:', result);

                    // Store the JWT token and its expiration
                    Cookies.set('jwt_token', result.token, {
                        expires: new Date(result.expiresAt),
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'Lax',
                    });
                    Cookies.set('user_id', result.id, {
                        expires: new Date(result.expiresAt),
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'Lax',
                    });

                    // Full page reload to ensure auth state is updated across Next.js components
                    window.location.href = '/dashboard';
                } else {
                    const errorData = result || { error: 'Bilinmeyen hata' };
                    console.error('Giriş başarısız:', errorData.error);
                    toast({
                        title: 'Giriş Başarısız',
                        description: errorData.error,
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Ağ hatası veya beklenmeyen sorun:', error);
                toast({
                    title: 'Hata',
                    description: 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.',
                    variant: 'destructive',
                });
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-posta</FormLabel>
                                <FormControl>
                                    <Input placeholder="E-posta adresinizi girin" {...field} />
                                </FormControl>
                                <FormDescription>Giriş yapmak için e-posta adresinizi girin.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {step === 2 && (
                    <>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-posta</FormLabel>
                                    <FormControl>
                                        {/* Email is pre-filled and disabled in step 2 */}
                                        <Input placeholder="E-posta adresinizi" {...field} disabled />
                                    </FormControl>
                                    <FormDescription>E-posta adresiniz.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kod</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Giriş kodunuzu girin" {...field} />
                                    </FormControl>
                                    <FormDescription>E-posta adresinize gönderilen 6 haneli kodu girin.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Giriş Yap</Button>
                        <Button variant="link" onClick={() => setStep(1)} className="w-full">
                            E-postayı Değiştir
                        </Button>
                    </>
                )}

                {/* Only show "Devam Et" button in step 1 */}
                {step === 1 && (
                    <Button type="submit">Devam Et</Button>
                )}
            </form>
        </Form>
    );
}
