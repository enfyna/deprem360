'use client'

import { ScrollArea } from "./scroll-area";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

function Duyuru(prop: any) {
    const { props } = prop;

    let subject: string = props['subject'] ?? '';
    if (subject.length > 10) subject = subject.substring(0, 10) + '...';

    let content: string = props['content'] ?? '';
    if (content.length > 10) content = content.substring(0, 100) + '...';

    return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle>
                    {subject}
                </CardTitle>
                <CardDescription>
                    {props['districtName'] ?? ''}/{props['provinceName'] ?? ''}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    )
}

export function Duyurular(props: any) {
    const [duyurular, setDuyurular] = useState<[]>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {

                const response = await api.get('/announcements');
                setDuyurular(response.data);

            } catch (err) {
                console.error("Failed to fetch user data:", err);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="h-lvh md:max-w-48 m-4 md:m-0 rounded-none border-b bg-card text-card-foreground shadow sticky top-0 flex justify-between">
            <ScrollArea>
                {duyurular.map((elm: any, idx: number) => (
                    <Duyuru props={elm} key={elm.id ?? idx} />
                ))}
            </ScrollArea>
        </div >
    )
}
