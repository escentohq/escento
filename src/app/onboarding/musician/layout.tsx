import { ProgressBar } from "./_progress-bar";

interface MusicianOnboardingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ step?: string }>;
}

export default async function MusicianOnboardingLayout({
  children,
  params: paramsPromise,
}: MusicianOnboardingLayoutProps) {
  const params = await paramsPromise;
  const stepMap: Record<string, number> = {
    basics: 1,
    sound: 2,
    portfolio: 3,
    rates: 4,
    availability: 5,
    social: 6,
    preferences: 7,
  };

  const currentStep = params.step ? stepMap[params.step] || 1 : 1;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ProgressBar currentStep={currentStep} totalSteps={7} />
      <main className="mx-auto max-w-xl px-6 py-12">
        {children}
      </main>
    </div>
  );
}
