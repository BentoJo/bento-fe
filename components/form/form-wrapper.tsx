import { FormWrapperProps } from "@/types/auth/form";

export const FormWrapper = ({ onSubmit, children }: FormWrapperProps) => {
  return <form onSubmit={onSubmit}>{children}</form>;
};
