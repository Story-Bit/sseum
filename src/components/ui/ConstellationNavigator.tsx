'use client';

import React from 'react';
import { useJourneyStore } from '@/components/stages/journeyStore';
import { motion } from 'framer-motion';

export const ConstellationNavigator = () => {
  const { currentStep, totalSteps, steps, goToStep } = useJourneyStore();
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full max-w-2xl px-4 py-2">
      <div className="relative h-2 bg-gray-200 rounded-full">
        <motion.div
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center">
          {steps.map((name, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber <= currentStep;
            return (
              <div key={stepNumber} className="relative group flex items-center">
                <button
                  onClick={() => isCompleted && goToStep(stepNumber)}
                  disabled={!isCompleted}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-blue-600 cursor-pointer' : 'bg-gray-300'
                  } ${stepNumber === currentStep ? 'ring-4 ring-blue-300' : ''}`}
                />
                <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {name}
                  <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
