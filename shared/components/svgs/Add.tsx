import { IconProps } from "../../types/icon-svg";

const Add = ({ width, height, fill }: IconProps) => {
  return (
    <svg
      width={width || "14"}
      height={height || "14"}
      viewBox="0 0 14 14"
      fill={fill || "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 6.58333H12.4167M6.58333 12.4167V0.75"
        stroke="#0F172A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Add;
