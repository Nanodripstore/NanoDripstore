import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
const page = async () => {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return (
      <h1 className="text-2xl font-bold text-center mt-10">Admin Page {session.user.username || session.user.name }</h1>
    )
  }
  return (
    <h1>Please Login to see this page</h1>
  )
}

export default page
