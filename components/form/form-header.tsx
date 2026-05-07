import { FormHeaderProps } from "@/types/auth/form";

export const FormHeader = ({ title, subtitle }: FormHeaderProps) => {
  return (
    <div className="max-h-36 text-center flex flex-col items-center justify-center">
      <h2 className="font-bold text-white text-2xl">{title}</h2>
      {subtitle && <p className="mt-4 text-[#94A3B8] text-sm">{subtitle}</p>}
    </div>
  );
};
