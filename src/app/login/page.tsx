'use client'

import { Card } from "@/components/ui/card";

export default function LoginPage() {
    return (
        <div className="w-100 min-h-96 flex items-center justify-center">
            <Card className="p-4">
                <LoginForm1></LoginForm1>
            </Card>
        </div>
    );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast"; // Assuming you have a toast component
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

// Define your Zod schema for the form
const FormSchema1 = z.object({
    email: z.string().email({ message: "Invalid email address." }),
});

function LoginForm1() {
    const form = useForm<z.infer<typeof FormSchema1>>({
        resolver: zodResolver(FormSchema1),
        defaultValues: {
            email: "",
        },
    });

    const router = useRouter();

    async function onSubmit1(data: z.infer<typeof FormSchema1>) {
        try {
            const res = await fetch("https://engaging-solely-maggot.ngrok-free.app/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login: data.email, // Assuming 'login' is the key your backend expects for the email
                }),
            });

            const result = await res.json();
            if (res.ok && result['email'] != undefined) {
                console.log("Email successful:", result);

                router.push('/login2');
            } else {
                console.error("Login failed:", result || "Unknown error");
                toast({
                    title: "Login Failed",
                    description: result.error || "An unexpected error occurred.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Network error or unexpected issue:", error);
            toast({
                title: "Error",
                description: "Could not connect to the server. Please try again.",
                variant: "destructive",
            });
        }
    }

    return (
        <Form  {...form} >
            <form onSubmit={(e) => {
                e.preventDefault();
                console.log("submit event fired");
                form.handleSubmit(onSubmit1)(e);
            }}
                className="space-y-6"
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormDescription>Email gir.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form >
    );
}
