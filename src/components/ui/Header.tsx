'use client';
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "./theme-toggle";
import Cookies from "js-cookie";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "./navigation-menu";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export function Header() {
    const [token, setToken] = useState(Cookies.get('jwt_token'));
    const router = useRouter();

    function logOff() {
        Cookies.remove("jwt_token");
        Cookies.remove("user_id");
        setToken('');
    }

    return (
        <div className="w-full z-50 rounded-none border-b bg-card text-card-foreground shadow sticky top-0 p-1 flex justify-between">
            <Link href={'/'}>
                <Image
                    src="/chatgpt.png"
                    alt="Deprem360 Logo"
                    width={150}
                    height={50}
                    className="h-10 w-auto"
                ></Image>
            </Link>

            <div className="flex gap-4">
                
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <Link href="/help" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Yardım
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
                                        Dashboard
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
