
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();

    const [userId, setUserId] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [avatarPath, setAvatarPath] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadProfile() {
            const { data: { user }, error: authError } =
                await supabase.auth.getUser();

            if (authError || !user) {
                router.replace("/login");
                return;
            }

            setUserId(user.id);

            const { data, error } = await supabase
                .from("profiles")
                .select("first_name, last_name, avatar_url")
                .eq("id", user.id)
                .single();

            if (error) {
                setMessage("Error loading profile: " + error.message);
            } else {
                setFirstName(data.first_name ?? "");
                setLastName(data.last_name ?? "");
                setAvatarPath(data.avatar_url);

                if (data.avatar_url) {
                    const { data: imageData } = await supabase.storage
                        .from("avatars")
                        .createSignedUrl(data.avatar_url, 3600);

                    setAvatarUrl(imageData?.signedUrl ?? null);
                }
            }

            setLoading(false);
        }

        loadProfile();
    }, [supabase, router]);

    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!userId) return;

        setSaving(true);
        setMessage("");

        let newAvatarPath = avatarPath;

        if (photo) {
            if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
                setMessage("Please select a JPG, PNG, or WebP image.");
                setSaving(false);
                return;
            }

            if (photo.size > 2 * 1024 * 1024) {
                setMessage("Please select an image smaller than 2 MB.");
                setSaving(false);
                return;
            }

            const extension =
                photo.type === "image/png" ? "png" :
                    photo.type === "image/webp" ? "webp" : "jpg";

            const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, photo, {
                    contentType: photo.type,
                });

            if (uploadError) {
                setMessage("Upload failed: " + uploadError.message);
                setSaving(false);
                return;
            }

            newAvatarPath = filePath;
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                first_name: firstName || null,
                last_name: lastName || null,
                avatar_url: newAvatarPath,
            })
            .eq("id", userId)
            .select("id")
            .single();

        if (error) {
            setMessage("Error saving profile: " + error.message);
        } else {
            setAvatarPath(newAvatarPath);

            if (newAvatarPath) {
                const { data: imageData } = await supabase.storage
                    .from("avatars")
                    .createSignedUrl(newAvatarPath, 3600);

                setAvatarUrl(imageData?.signedUrl ?? null);
            }

            setPhoto(null);
            setMessage("Profile saved successfully!");
        }

        setSaving(false);
    }

    async function handleSignOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            setMessage(error.message);
            return;
        }

        router.push("/login");
        router.refresh();
    }

    if (loading) {
        return <main className="min-h-screen px-4 py-10 text-slate-500 sm:px-6 sm:py-16">Loading profile...</main>;
    }

    return (
        <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-xl">
                <header className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Account</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">My Profile</h1>
                    <p className="mt-3 leading-7 text-slate-600">Keep your personal details and profile photo up to date.</p>
                </header>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

            {avatarUrl && (
                <img
                    src={avatarUrl}
                    alt="Profile photo"
                    className="h-24 w-24 rounded-full border-4 border-slate-100 object-cover shadow-sm"
                />
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSave}>
                <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="first-name">First Name</label>
                    <input
                        id="first-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="last-name">Last Name</label>
                    <input
                        id="last-name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="photo">Profile Photo</label>
                    <input
                        id="photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                        className="mt-2 block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 transition-colors hover:border-slate-400"
                    />
                </div>

                <button type="submit" disabled={saving} className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300">
                    {saving ? "Saving..." : "Save Profile"}
                </button>
            </form>

            {message && <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" role="status">{message}</p>}

                </section>

            <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium">
                <Link className="text-slate-600 transition-colors hover:text-blue-600" href="/">Back to Home</Link>
                <Link className="text-slate-600 transition-colors hover:text-blue-600" href="/members">Members Only Page</Link>
            </nav>

            <button onClick={handleSignOut} className="mt-6 text-sm font-medium text-slate-500 transition-colors hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Sign Out
            </button>
            </div>
        </main>
    );
}
