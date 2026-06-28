export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="flex justify-end gap-4 p-4">
        <a
          href="/signup"
          className="rounded bg-foreground text-background px-4 py-2 font-medium"
        >
          Sign Up
        </a>
        <a
          href="/login"
          className="rounded border border-foreground px-4 py-2 font-medium"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}
