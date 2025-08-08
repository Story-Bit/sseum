// /src/components/ui/JourneyProgressBar.tsx
'use client';

interface JourneyProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const JourneyProgressBar = ({ currentStep, totalSteps }: JourneyProgressBarProps) => {
  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-interaction-gray-100 z-50">
      <div
        className="h-1 bg-inspiration-gold transition-all duration-300 ease-in-out"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};