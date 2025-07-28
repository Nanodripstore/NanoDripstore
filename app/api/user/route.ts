import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import * as z from "zod";

//Define a schema for input validation
const userSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have than 8 characters')
  })

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password } = userSchema.parse(body);

    //check if email already exists
    const exitingUserByEmail = await db.user.findUnique({
      where: { email: email }
    });
    if (exitingUserByEmail) {
      return Response.json({ user: null, message: "User with this email already exists" }, { status: 409 });
    }
    //check if username already exists
    const exitingUserByUsername = await db.user.findUnique({
      where: { name: username }
    });
    if (exitingUserByUsername) {
      return Response.json({ user: null, message: "User with this username already exists" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await db.user.create({
      data: {
        email,
        name: username, // Store username in the name field as per schema
        password: hashedPassword
      }
    });
    const { password: newUserPassword , ...rest } = newUser;

    return Response.json({user: rest, message: "User created successfully"}, {status: 201});
  } catch (error) {
    return Response.json({ user: null, message: "Something went wrong" }, { status: 500 });
  }
}
