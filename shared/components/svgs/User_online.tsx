import { IconProps } from "../../types/icon-svg";

const User_online = ({ width, height, fill }: IconProps) => {
  return (
    <svg
      width={width || "14"}
      height={height || "14"}
      viewBox="0 0 18 18"
      fill={fill || "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.25 6C11.25 3.92893 9.57105 2.25 7.5 2.25C5.42893 2.25 3.75 3.92893 3.75 6C3.75 8.07105 5.42893 9.75 7.5 9.75C9.57105 9.75 11.25 8.07105 11.25 6Z"
        stroke="#008447"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.25 15C2.25 12.1005 4.60051 9.75 7.5 9.75C8.96902 9.75 10.2971 10.3534 11.25 11.3257"
        stroke="#008447"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.75 13.875C9.75 13.875 10.7614 14.255 11.25 15.75C11.25 15.75 13.6324 12 15.75 11.25"
        stroke="#008447"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default User_online;
