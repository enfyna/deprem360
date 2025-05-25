'use client';
import { locationStore } from '@/app/AppStore';
import { useState, useEffect } from 'react'; // Removed useContext as it's not used
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Added CardContent, Description, Header, Title
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
import Image from 'next/image'; // Next.js Image bileşeni
import { Mail, User, MapPin, Send, Loader2, Building, Users } from 'lucide-react'; // İkonlar

// Zod Schema for Form Validation
const RegisterFormSchema = z.object({
    email: z.string().email({ message: 'Geçersiz e-posta adresi.' }),
    name: z.string().min(2, { message: 'Ad en az 2 karakter olmalı.' }),
    surname: z.string().min(2, { message: 'Soyad en az 2 karakter olmalı.' }),
    provinceName: z.string().min(1, { message: 'Lütfen bir il seçin.' }),
    districtName: z.string().min(1, { message: 'Lütfen bir ilçe seçin.' }),
});

// Main RegisterPage Component
export default function RegisterPage() {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-900 p-4 py-8">
            <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800 p-6 border-b dark:border-slate-700">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/registerScreenLogo.png" // public klasöründeki resim
                            alt="Deprem360 Kayıt Logo"
                            width={100} // İstenilen genişlik
                            height={100} // İstenilen yükseklik
                            className="rounded-full"
                        />
                    </div>
                    <CardTitle className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100">Hesap Oluşturun</CardTitle>
                    <CardDescription className="text-center text-slate-600 dark:text-slate-400 pt-1">
                        Bilgilerinizi girerek aramıza katılın.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                    <RegisterForm />
                </CardContent>
            </Card>
            <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} Deprem360. Tüm hakları saklıdır.
            </footer>
        </div>
    );
}

// RegisterForm Component
function RegisterForm() {
    const router = useRouter();
    const locations = locationStore.locations;

    const [isLoading, setIsLoading] = useState(false);
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
            const provinceData = (locations as unknown as Array<{ name: string; districts: Array<{ name: string }> }>).find(loc => loc.name === selectedProvince);
            if (provinceData) {
                setSelectedProvinceDistricts((provinceData.districts || []).filter(d => d.name && d.name.trim() !== ''));
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
        setIsLoading(true);
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
                toast({
                    title: 'Kayıt Başarılı!',
                    description: 'Hesabınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.',
                });
                router.push('/login');
            } else {
                toast({
                    title: 'Kayıt Başarısız',
                    description: result.error || result.message || 'Beklenmeyen bir hata oluştu.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Hata',
                description: 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
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
                            <FormLabel className="text-slate-700 dark:text-slate-300">E-posta Adresiniz</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type="email"
                                        placeholder="ornek@eposta.com"
                                        {...field}
                                        disabled={isLoading}
                                        className="pl-10 h-12 text-base border-slate-300 dark:border-slate-600 focus:border-sky-500 dark:focus:border-sky-500"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 dark:text-slate-300">Adınız</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <Input
                                            placeholder="Adınız"
                                            {...field}
                                            disabled={isLoading}
                                            className="pl-10 h-12 text-base border-slate-300 dark:border-slate-600 focus:border-sky-500 dark:focus:border-sky-500"
                                        />
                                    </div>
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
                                <FormLabel className="text-slate-700 dark:text-slate-300">Soyadınız</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                                        <Input
                                            placeholder="Soyadınız"
                                            {...field}
                                            disabled={isLoading}
                                            className="pl-10 h-12 text-base border-slate-300 dark:border-slate-600 focus:border-sky-500 dark:focus:border-sky-500"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="provinceName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 dark:text-slate-300">İl</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                <FormControl>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                        <SelectTrigger className="pl-10 h-12 text-base border-slate-300 dark:border-slate-600 focus:ring-sky-500 dark:focus:ring-sky-500">
                                            <SelectValue placeholder="Bir il seçin" />
                                        </SelectTrigger>
                                    </div>
                                </FormControl>
                                <SelectContent>
                                    {(locations as unknown as Array<{ name: string; districts: Array<{ name: string }> }>)
                                        .filter(province => province.name && province.name.trim() !== '')
                                        .map((province) => (
                                            <SelectItem key={province.name} value={province.name}>
                                                {province.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="districtName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 dark:text-slate-300">İlçe</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProvince || isLoading}>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                        <SelectTrigger className="pl-10 h-12 text-base border-slate-300 dark:border-slate-600 focus:ring-sky-500 dark:focus:ring-sky-500">
                                            <SelectValue placeholder={selectedProvince ? "Bir ilçe seçin" : "Önce il seçin"} />
                                        </SelectTrigger>
                                    </div>
                                </FormControl>
                                <SelectContent>
                                    {selectedProvinceDistricts.length > 0 ? (
                                        selectedProvinceDistricts
                                            .map((district) => (
                                                <SelectItem key={district.name} value={district.name}>
                                                    {district.name}
                                                </SelectItem>
                                            ))
                                    ) : (
                                        <SelectItem value="no-districts-found" disabled>
                                            {selectedProvince ? "İlçe bulunamadı" : "Lütfen önce il seçin"}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full h-12 text-lg font-semibold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-5 w-5" />
                    )}
                    {isLoading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
                </Button>
            </form>
        </Form>
    );
}