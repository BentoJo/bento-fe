import { FormWrapperProps } from "@/features/auth/types/form";

export const FormWrapper = ({ onSubmit, children }: FormWrapperProps) => {
  return <form onSubmit={onSubmit}>{children}</form>;
};
