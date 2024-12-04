import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full flex-col">
      <h2 className="text-xl">Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}
