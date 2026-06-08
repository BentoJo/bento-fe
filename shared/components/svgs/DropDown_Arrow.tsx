import { IconProps } from "../../types/icon-svg";

const Dropdown_Arrow = ({ width, height, fill, className }: IconProps) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.1663 7.49996L9.99967 11.6666L5.83301 7.49996"
        stroke="#F8FAFC"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Dropdown_Arrow;
