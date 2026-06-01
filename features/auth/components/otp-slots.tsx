import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp";

interface OtpSlotsProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
}

/** 6-digit OTP input matching the ManeJo "Check your Email" design. */
export function OtpSlots({ value, onChange, onBlur, name, disabled }: OtpSlotsProps) {
  return (
    <InputOTP
      maxLength={6}
      containerClassName="w-full"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      disabled={disabled}
    >
      <InputOTPGroup className="w-full justify-between gap-1">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
