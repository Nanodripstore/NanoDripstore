import Link from "next/link";
import { Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div className="bg-zinc-100 py-2 border-b border-zinc-200 fixed w-full top-0 z-10">
      <div className="container flex items-center justify-between">
        <Link href="/">
          <Mail />
        </Link>
        {session?.user ? (
            <UserAccountNav />
        ) : (
          <Link href="/sign-in" className={buttonVariants()}>
            Sign in
          </Link>
        )
        }
      </div>
    </div>
  );
};

export default Navbar;
