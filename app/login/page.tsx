
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function handleGoogleLogin() {
        setErrorMessage(null);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setErrorMessage(error.message);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Jokes List</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Welcome back</h1>
                <p className="mt-3 leading-7 text-slate-600">Sign in to access your profile and members-only content.</p>

                <button
                    onClick={handleGoogleLogin}
                    className="mt-8 flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Sign in with Google
                </button>

                {errorMessage && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{errorMessage}</p>}
            </section>
        </main>
    );
}

