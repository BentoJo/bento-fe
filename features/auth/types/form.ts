import { ReactNode } from "react";

export interface FormContainerProps {
  children: ReactNode;
  className?: string;
}

export interface FormHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
}

export interface FormWrapperProps {
  onSubmit?: () => void;
  children: React.ReactNode;
}