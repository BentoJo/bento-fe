import { getAuthSession } from "@/lib/auth/server";
import FormContainer from "@/components/form/form-container";
import { FormHeader } from "@/components/form/form-header";
import { FormBody } from "@/components/form/form-body";
import { FormFooter } from "@/components/form/form-footer";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import StepImage from "@/components/shared/step-image";

export default async function Home() {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="relative mx-auto flex h-fit w-full max-w-7xl items-center justify-center gap-8 lg:gap-10">
        <div className="absolute inset-y-0 left-0 z-0 w-9/12 rounded-2xl bg-[#0F172A]" />
        <StepImage
          width={2000}
          height={2000}
          src={"/start-page.png"}
          alt="Kanban Board"
          className="max-w-3/5 z-10"
        />
        <>
          <FormContainer className="relative z-10">
            <FormHeader
              title={
                <>
                  Welcome to Mane<span className="text-blue-500">Jo</span>
                </>
              }
              subtitle={
                <>
                  Organize your tasks, collaborate with your team, <br />
                  and track progress in one place.
                </>
              }
            />
            <FormBody>
              <div className="flex flex-col items-center justify-center">
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    className="bg-blue-500 cursor-pointer hover:bg-blue-500/85 px-12"
                  >
                    Continue With Email
                  </Button>
                </Link>
                <p className="mt-4 text-center text-xs text-white">
                  Secure login • No password required
                </p>
              </div>
            </FormBody>
            <FormFooter>
              <p className="text-center text-xs text-[#64748B]">
                By continuing, you agree to our Terms of Service and Privacy
                Policy.
                <br />
                We’ll never share your email with anyone
              </p>
            </FormFooter>
          </FormContainer>
        </>
      </div>
    </main>
  );
}
