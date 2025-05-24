import Link from "next/link";
import { Button } from "./button";
import { ModeToggle } from "./theme-toggle";
import { ScrollArea } from "./scroll-area";

function Duyuru() {
    return (
        <div className="border bg-card text-card-foreground shadow m-4 p-2 min-w-48">
            Duyuru
        </div>
    )
}

export function Duyurular() {
    return (
        <div className="h-lvh w-full md:max-w-48 m-6 md:m-0 rounded-none border-b bg-card text-card-foreground shadow sticky top-0 flex justify-between">
            <ScrollArea className="h-full w-full">
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
                <Duyuru></Duyuru>
            </ScrollArea>
        </div >
    )
}
