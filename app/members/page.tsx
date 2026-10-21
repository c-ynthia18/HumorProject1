
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default function MembersPage() {
    return (
        <Suspense fallback={<p>Checking login...</p>}>
            <MembersContent />
        </Suspense>
    );
}

async function MembersContent() {
    // Wait until an actual user requests the page
    await connection();

    const supabase = await createClient();

    // Check if the user is logged in
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
            <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Member area</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Members Only</h1>

                <div className="mt-6 space-y-3 leading-7 text-slate-600">
                    <p>Welcome! You are successfully logged in.</p>
                    <p>This page is only accessible to authenticated users.</p>
                </div>

                <Link
                    href="/profile"
                    className="mt-8 inline-flex items-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Go to My Profile
                </Link>
            </section>
        </main>
    );
}
