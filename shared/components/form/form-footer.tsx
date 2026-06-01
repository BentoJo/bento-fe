type FormFooterProps = {
  children: React.ReactNode;
  step?: number;
  totalSteps?: number;
};

export const FormFooter = ({ children, step, totalSteps }: FormFooterProps) => {
  const showProgress =
    typeof step === "number" && typeof totalSteps === "number";

  return (
    <div className="mt-8 w-full">
      {children}

      {showProgress && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const current = index + 1 === step;

              return (
                <div
                  key={index}
                  className={`
                    rounded-full transition-all duration-300
                    ${
                      current ? "h-1 w-12 bg-[#3B82F6]" : "h-1 w-4 bg-[#1E293B]"
                    }
                  `}
                />
              );
            })}
          </div>

          {/* Text */}
          <p className="text-[10px] font-medium tracking-wide text-[#64748B]">
            Step {step} of {totalSteps}
          </p>
        </div>
      )}
    </div>
  );
};
