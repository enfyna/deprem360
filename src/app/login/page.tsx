'use client'
import { Card } from "@/components/ui/card";
import LoginForm from "./form";

export default function LoginPage() {
    return (
        <div className="w-100 min-h-96 flex items-center justify-center">
            <Card className="p-4">
                <LoginForm></LoginForm>
            </Card>
        </div>
    );
}
