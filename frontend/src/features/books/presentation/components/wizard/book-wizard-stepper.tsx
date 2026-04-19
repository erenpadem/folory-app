'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, BookOpen, FileText, LayoutGrid, PenLine, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BookWizardStep {
  number: number;
  title: string;
  icon: ReactNode;
}

export const BOOK_WIZARD_STEPS: BookWizardStep[] = [
  { number: 1, title: 'Kapak & Bilgiler', icon: null },
  { number: 2, title: 'Bölümler', icon: null },
  { number: 3, title: 'Sayfalar', icon: null },
  { number: 4, title: 'Yazım', icon: null },
  { number: 5, title: 'Önizleme & Yayınla', icon: null },
];

const iconMap = {
  1: BookOpen,
  2: FileText,
  3: LayoutGrid,
  4: PenLine,
  5: Rocket,
} as const;

interface BookWizardStepperProps {
  steps: BookWizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  /** Daha dar alanlar (mobil navbar vb.) */
  compact?: boolean;
  className?: string;
}

export function BookWizardStepper({
  steps,
  currentStep,
  onStepClick,
  compact = false,
  className,
}: BookWizardStepperProps) {
  return (
    <div
      className={cn(
        'bg-background/90 backdrop-blur-md border border-border/50 rounded-full px-2 py-1.5 shadow-sm',
        compact ? 'max-w-full' : 'px-3 py-2',
        className
      )}
    >
      <div
        className="grid grid-cols-5 gap-0 items-center relative"
      >
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const IconComponent = iconMap[step.number as keyof typeof iconMap];

          return (
            <div
              key={step.number}
              className="relative flex flex-col items-center justify-center min-w-0"
            >
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 left-full w-full h-0.5 pointer-events-none z-0">
                  <div className="absolute inset-0 bg-muted/30 rounded-full" />
                  <motion.div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full',
                      isCompleted ? 'bg-primary' : 'bg-muted/30'
                    )}
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: isCompleted ? 1 : currentStep === step.number ? 0.5 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ transformOrigin: 'left' }}
                  />
                </div>
              )}

              <motion.button
                type="button"
                onClick={() => onStepClick?.(step.number)}
                disabled={!onStepClick}
                className={cn(
                  'relative rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 z-10 border-2',
                  compact ? 'w-8 h-8' : 'w-9 h-9 md:w-10 md:h-10',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground shadow-md'
                    : isActive
                      ? 'bg-primary border-primary text-primary-foreground shadow-md ring-2 ring-primary/20'
                      : 'bg-background border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50',
                  onStepClick && 'cursor-pointer hover:scale-105'
                )}
                animate={{ scale: isActive ? 1.06 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <Check className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                ) : IconComponent ? (
                  <IconComponent
                    className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                ) : (
                  step.icon
                )}
              </motion.button>
              <span
                className={cn(
                  'font-medium mt-1 text-center leading-tight px-0.5 truncate w-full',
                  compact ? 'text-[8px]' : 'text-[9px] md:text-[10px]',
                  isActive
                    ? 'text-foreground font-semibold'
                    : isCompleted
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/70'
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
