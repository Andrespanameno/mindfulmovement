import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Apple } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Mindful Movement" },
      { name: "description", content: "Welcome back to your center. Sign in to Mindful Movement." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col px-8 pt-20 pb-10">
        <div className="size-12 bg-primary/25 rounded-2xl flex items-center justify-center mb-8">
          <div className="size-4 rounded-full bg-primary" />
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-balance mb-3">
          Welcome back to your center
        </h1>
        <p className="text-base text-muted-foreground text-pretty mb-10">
          Take a deep breath. Let's start your day with intention.
        </p>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/home" });
          }}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground ml-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              className="w-full h-12 px-4 rounded-xl bg-secondary/60 ring-1 ring-black/5 focus:ring-2 focus:ring-primary outline-none transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl bg-secondary/60 ring-1 ring-black/5 focus:ring-2 focus:ring-primary outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 bg-foreground text-background rounded-xl font-medium text-sm hover:opacity-90 transition"
          >
            Enter your space
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/home" })}
            className="w-full h-12 bg-card text-foreground rounded-xl font-medium text-sm ring-1 ring-black/5 hover:bg-secondary transition flex items-center justify-center gap-2"
          >
            <Apple className="size-4" />
            Continue with Apple
          </button>
        </form>

        <div className="mt-auto pt-12 text-center">
          <p className="text-sm text-muted-foreground">
            New to Mindful Movement?{" "}
            <Link to="/home" className="text-foreground font-medium">
              Begin journey
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
