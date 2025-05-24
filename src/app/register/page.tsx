'use client';
import { locationStore } from '@/app/AppStore';
import { useState, useContext, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Assuming you have a LocationContext defined elsewhere:


// ---
// Zod Schema for Form Validation
// ---
const RegisterFormSchema = z.object({
    email: z.string().email({ message: 'Geçersiz e-posta adresi.' }),
    name: z.string().min(2, { message: 'Ad en az 2 karakter olmalı.' }),
    surname: z.string().min(2, { message: 'Soyad en az 2 karakter olmalı.' }),
    provinceName: z.string().min(1, { message: 'Lütfen bir il seçin.' }),
    districtName: z.string().min(1, { message: 'Lütfen bir ilçe seçin.' }),
});

// ---
// Main RegisterPage Component
// ---
export default function RegisterPage() {
    return (
        <div className="w-100 min-h-screen flex items-center justify-center">
            <Card className="p-8">
                <RegisterForm />
            </Card>
        </div>
    );
}

// ---
// RegisterForm Component
// ---
function RegisterForm() {
    const router = useRouter();
    const locations = locationStore.locations;
    console.log('Locations:', locations);

    
    const [selectedProvinceDistricts, setSelectedProvinceDistricts] = useState<Array<{ name: string }>>([]);

    const form = useForm<z.infer<typeof RegisterFormSchema>>({
        resolver: zodResolver(RegisterFormSchema),
        defaultValues: {
            email: '',
            name: '',
            surname: '',
            provinceName: '',
            districtName: '',
        },
        mode: 'onChange',
    });

    const selectedProvince = form.watch('provinceName');

    useEffect(() => {
        if (selectedProvince) {
            const provinceData = (locations as unknown as []).find(loc => loc['name'] === selectedProvince);
            if (provinceData) {
                // Filter out any districts with empty names before setting
                setSelectedProvinceDistricts((provinceData['districts'] as unknown as []).filter(d => d['name']));
            } else {
                setSelectedProvinceDistricts([]);
            }
            form.setValue('districtName', '');
            form.clearErrors('districtName');
        } else {
            setSelectedProvinceDistricts([]);
            form.setValue('districtName', '');
        }
    }, [selectedProvince, locations, form]);

    async function onSubmit(data: z.infer<typeof RegisterFormSchema>) {
        try {
            const res = await fetch('https://engaging-solely-maggot.ngrok-free.app/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: {
                        email: data.email,
                        name: data.name,
                        surname: data.surname,
                        provinceName: data.provinceName,
                        districtName: data.districtName,
                    },
                }),
            });

            const result = await res.json();
            if (res.ok) {
                console.log('Kayıt başarılı:', result);
                toast({
                    title: 'Kayıt Başarılı!',
                    description: 'Hesabınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.',
                });
                router.push('/login');
            } else {
                console.error('Kayıt başarısız:', result || 'Bilinmeyen hata');
                toast({
                    title: 'Kayıt Başarısız',
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
                                <Input placeholder="E-posta adresinizi girin" {...field} />
                            </FormControl>
                            <FormDescription>Hesabınız için bir e-posta adresi.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ad</FormLabel>
                            <FormControl>
                                <Input placeholder="Adınızı girin" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Soyad</FormLabel>
                            <FormControl>
                                <Input placeholder="Soyadınızı girin" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Province Select */}
                <FormField
                    control={form.control}
                    name="provinceName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>İl</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Bir il seçin" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {/* Filter out items with empty names before mapping */}
                                    {locations!!
                                        .filter(province => province['name'])
                                        .map((province) => (
                                            <SelectItem key={province['name']} value={province['name']}>
                                                {province['name']}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Yaşadığınız ili seçin.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* District Select */}
                <FormField
                    control={form.control}
                    name="districtName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>İlçe</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProvince}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={selectedProvince ? "Bir ilçe seçin" : "Önce il seçin"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {selectedProvinceDistricts.length > 0 ? (
                                        // Filter out items with empty names before mapping
                                        selectedProvinceDistricts
                                            .filter(district => district.name && district.name.trim() !== '')
                                            .map((district) => (
                                                <SelectItem key={district.name} value={district.name}>
                                                    {district.name}
                                                </SelectItem>
                                            ))
                                    ) : (
                                        <SelectItem value="no-districts-found" disabled> {/* Use a non-empty, disabled value */}
                                            İlçe bulunamadı
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormDescription>Yaşadığınız ilçeyi seçin.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Kayıt Ol</Button>
            </form>
        </Form>
    );
}
