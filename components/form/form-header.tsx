import { FormHeaderProps } from "@/types/auth/form";

export const FormHeader = ({ title, subtitle }: FormHeaderProps) => {
  return (
    <div className="mb-8 text-center">
      <h2 className="font-bold text-white text-2xl">{title}</h2>

      {subtitle && <p className="mt-4 text-[#94A3B8] text-sm">{subtitle}</p>}
    </div>
  );
};
