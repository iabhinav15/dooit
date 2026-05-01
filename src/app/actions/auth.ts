"use server";

import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

type AuthActionState = { error?: string } | null;

export async function signupAction(
  _state: AuthActionState,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || password.length < 6) {
    return { error: "Invalid email or password (min 6 characters)" };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "User already exists" };
  }

  const hashedPassword = await hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  await createSession(user.id);
  redirect("/");
}

export async function loginAction(_state: AuthActionState, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Invalid email or password" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "User not found" };
  }

  const isValid = await compare(password, user.password);
  if (!isValid) {
    return { error: "Invalid password" };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
