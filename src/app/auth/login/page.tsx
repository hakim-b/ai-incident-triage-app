import { LoginForm } from "~/components/auth/login-form";

export const metadata = {
  title: "Sign In - Delivery Desk",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginForm defaultError={error} />
    </main>
  );
}
