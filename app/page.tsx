import Navbar from "@/components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <h1 className="text-4xl">Home</h1>
      <Link href="/admin">Admin Page</Link>
    </>
  );
}