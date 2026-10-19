
import { Suspense } from "react";
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
        <div>
            {jokes?.map((joke) => (
                <div key={joke.id} style={{ marginTop: "20px" }}>
                    <h2>{joke.question}</h2>
                    <p>{joke.answer}</p>
                </div>
            ))}
        </div>
    );
}

export default function Home() {
    return (
        <main style={{ padding: "40px" }}>
            <h1>Jokes List</h1>
            <Suspense fallback={<p>Loading jokes...</p>}>
                <JokesList />
            </Suspense>
        </main>
    );
}
