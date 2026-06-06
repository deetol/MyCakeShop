"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {

    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser =
        localStorage.getItem("user");

        if (storedUser) {
        setUser(JSON.parse(storedUser));
        }
    }, []);

    function handleLogout() {
        localStorage.removeItem("User");
        router.push("/login");
    }

    return (
        <main className="p-10">
        <h1 className="text-4xl font-bold">
            Dashboard
        </h1>

        {user && (
            <>
            <div className="mt-6">
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            </div>
            <button
            onClick={handleLogout}
          className="mt-6 rounded bg-red-600 px-4 py-2 text-white"
        >
          Logout
            </button>
            </>
        )}
        </main>
    );
}
