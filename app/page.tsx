
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";

async function JokesList() {
    await connection();

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data: jokes, error } = await supabase
        .from("jokes")
        .select("*")
        .order("id");

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <section className="space-y-4">
            {jokes?.map((joke) => (
                <article
                    key={joke.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
                >
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                        {joke.question}
                    </h2>
                    <p className="mt-3 leading-7 text-slate-600">{joke.answer}</p>
                </article>
            ))}
        </section>
    );
}

export default function Home() {
    return (
        <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-3xl">
                <header className="mb-10 flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 pb-7">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Daily humor</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Jokes List</h1>
                        <p className="mt-3 max-w-xl leading-7 text-slate-600">A simple collection of jokes to brighten your day.</p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Log in
                    </Link>
                </header>
            <Suspense fallback={<p className="text-slate-500">Loading jokes...</p>}>
                <JokesList />
            </Suspense>
            </div>
        </main>
    );
}
