import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-[var(--color-bg-primary)] text-white">
      <h1 className="heading-display text-8xl mb-4 font-bold tracking-tighter">404</h1>
      <p className="text-[var(--color-text-secondary)] mb-8 text-xl font-medium">This page doesn&apos;t exist.</p>
      <Link href="/" className="btn btn-primary px-8 py-4">Go Home</Link>
    </div>
  );
}