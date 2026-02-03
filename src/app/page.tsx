import OnboardingClientWrapper from "@/components/onboarding-client-wrapper";
import { Logo } from "@/components/logo";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen w-full flex flex-col p-4 bg-background">
      <main className="flex-1 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Logo className="justify-center text-3xl mb-2" />
            <h1 className="text-4xl font-bold font-headline text-foreground">
              Welcome to Equitable Edge
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Let's set up your business for intelligent pricing and supply chain management.
            </p>
          </div>
          <OnboardingClientWrapper />
        </div>
      </main>
    </div>
  );
}
