import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F7ECE8] flex flex-col items-center justify-center p-6">
      <LoginForm />

      <p className="mt-8 text-sm text-[#8D7A72]">
        © 2026 MyCakeShop Internal System.
      </p>
    </main>
  );
}