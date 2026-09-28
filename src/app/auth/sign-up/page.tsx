import { SignUpForm } from "~/components/auth/sign-up-form";

export const metadata = {
  title: "Sign Up - Delivery Desk",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <SignUpForm />
    </main>
  );
}
