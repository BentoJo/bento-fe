import Image from "next/image";
import { FormContainerProps } from "@/types/auth/form";

const FormContainer = ({ className, children }: FormContainerProps) => {
  return (
    <div
      className={`backdrop-blur-lg bg-[#020617]/20 border-2 border-[#1E293B]/20 rounded-4xl shadow-lg p-8 lg:p-10 lg:py-16 flex w-full max-w-[480px] flex-col items-stretch justify-center ${className}`}
    >
      <div className="mb-8 flex items-center justify-center">
        <Image
          width={1536.46}
          height={380.68}
          src="/logo.svg"
          alt="ManeJo Logo"
          className="w-64"
        />
      </div>
      {children}
    </div>
  );
};

export default FormContainer;
