import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import Cookies from "js-cookie"; // Import js-cookie
import axios from "axios"; // Import axios

// Define your Zod schema for the form
const FormSchema1 = z.object({
    email: z.string().email({ message: "Invalid email address." }),
});

const FormSchema2 = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    code: z.string().max(6).min(6),
});

export default function LoginForm() {
    const form = useForm<z.infer<typeof FormSchema1>>({
        resolver: zodResolver(FormSchema1),
        defaultValues: {
            email: "",
        },
    });

    const form2 = useForm<z.infer<typeof FormSchema2>>({
        resolver: zodResolver(FormSchema2),
        defaultValues: {
            email: "",
            code: ''
        },
    });

    const router = useRouter();

    async function onSubmit1(data: z.infer<typeof FormSchema1>) {
        try {
            const res = await fetch("https://engaging-solely-maggot.ngrok-free.app/user/login", {
                method: "POST",
                // credentials: "include", // Cookie almak için şart
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login: data.email, // Assuming 'login' is the key your backend expects for the email
                }),
            });

            if (res.ok) {
                const result = await res.json();
                console.log("Email successful:", result);

            } else {
                const errorData = await res.json();
                console.error("Login failed:", errorData.error || "Unknown error");
                toast({
                    title: "Login Failed",
                    description: errorData.error || "An unexpected error occurred.",
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

    async function onSubmit2(data: z.infer<typeof FormSchema2>) {

        try {
            const res = await fetch("https://engaging-solely-maggot.ngrok-free.app/user/login", {
                method: "POST",
                // credentials: "include", // Cookie almak için şart
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login: data.email, // Assuming 'login' is the key your backend expects for the email
                    code: data.code,
                }),
            });

            if (res.ok) {
                const result = await res.json();
                console.log("Login successful:", result);

                // Store the JWT token and its expiration
                Cookies.set("jwt_token", result.token, {
                    expires: new Date(result.expiresAt), // Set expiration for the cookie
                    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
                    sameSite: "Lax", // Or 'Strict' depending on your needs
                });
                Cookies.set("user_id", result.id, {
                    expires: new Date(result.expiresAt),
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "Lax",
                });

                router.push("/dashboard");
            } else {
                const errorData = await res.json();
                console.error("Login failed:", errorData.error || "Unknown error");
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
        <Form {...form}>
            <form
                onSubmit={(e) => {
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
        </Form>
    );
}
