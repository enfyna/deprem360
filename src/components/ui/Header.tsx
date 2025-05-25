'use client';
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "./theme-toggle";
import Cookies from "js-cookie";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./navigation-menu";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";

export function Header() {
    const [token, setToken] = useState(Cookies.get('jwt_token'));
    const [isAdmin, setIsAdmin] = useState(Cookies.get('is_admin'));
    const router = useRouter();

    function logOff() {
        Cookies.remove("jwt_token");
        Cookies.remove("user_id");
        Cookies.remove('is_admin')
        setToken('');
    }

    const { theme } = useTheme();
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    return (
        <div className="w-full z-50 rounded-none border-b bg-card text-card-foreground shadow sticky top-0 p-1 flex justify-between">
            <Link href={'/'}>
                <Image
                    src="/depremLogo.png"
                    alt="Deprem360 Logo"
                    width={300}
                    height={300}
                    className={isDarkMode ? "dark:invert" : ""}
                />
            </Link>
            <div className="flex gap-4 items-center">
                <NavigationMenu>
                    <NavigationMenuList>
                        { isAdmin && isAdmin == 'true' ?
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <NavigationMenuLink className="p-4 m-4" asChild>
                                        <>
                                            <NavigationMenuItem>
                                                <Link href="/admin" legacyBehavior passHref>
                                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                                        Yardım Talepleri
                                                    </NavigationMenuLink>
                                                </Link>
                                            </NavigationMenuItem>
                                            <NavigationMenuItem>    
                                                <Link href="/announcement" legacyBehavior passHref>
                                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                                        Duyurular
                                                    </NavigationMenuLink>
                                                </Link>
                                            </NavigationMenuItem>
                                        </>
                                    </NavigationMenuLink>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            : null
                        }
                        <NavigationMenuItem>
                            <Link href="/help" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Yardım Talepleri
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        {!token ?
                        <>
                        <NavigationMenuItem>
                            <Link href="/register" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Kayıt Ol
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/login" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Giriş Yap
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                            </>
                        :
                        <> 
                        <NavigationMenuItem>
                            <Link href="/dashboard" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Tatbikat
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <button
                                    onClick={() => {
                                        logOff();
                                        router.push('/');
                                    }}
                                    className={navigationMenuTriggerStyle()}
                                >
                                    Çıkış Yap
                                </button>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        </>
                        }
                    </NavigationMenuList>
                </NavigationMenu>
            
                <ModeToggle></ModeToggle>
            </div >
        </div >
    )
}
