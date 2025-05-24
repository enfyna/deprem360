import Link from "next/link";
import { Button } from "./button";
import { ModeToggle } from "./theme-toggle";

export function Header() {
    return (
        <div className="w-full z-50 rounded-none border-b bg-card text-card-foreground shadow sticky top-0 p-1 flex justify-between">
            <Link href={'/'}>
                Deprem360
            </Link>
            <div className="flex gap-4">
                <Link href={'/register'}>
                    <Button>
                        Kayit Ol
                    </Button>
                </Link>
                <Link href={'/login'}>
                    <Button >
                        Giris Yap
                    </Button>
                </Link>
                <ModeToggle></ModeToggle>
            </div >
        </div >
    )
}
