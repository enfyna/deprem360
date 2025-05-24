// Example: In your /dashboard page or any component that needs authenticated data
'use client'
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from '@/lib/axios';

export default function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Ensure a token exists before making the request
                if (!Cookies.get("jwt_token")) {
                    setLoading(false);
                    setError("No authentication token found. Please log in.");
                    return;
                }

                const response = await api.get('/user');

                setUserData(response.data);

            } catch (err) {
                console.error("Failed to fetch user data:", err);
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Welcome to your Dashboard!</h1>
            {userData ? (
                <pre>{JSON.stringify(userData, null, 2)}</pre>
            ) : (
                <p>No user data available.</p>
            )}
            <button onClick={() => {
                Cookies.remove("jwt_token");
                Cookies.remove("user_id");
                window.location.href = "/login"; // Or router.push('/login') if you prefer soft navigation
            }}>
                Logout
            </button>
        </div>
    );
}
