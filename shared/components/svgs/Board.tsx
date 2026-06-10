import { IconProps } from "../../types/icon-svg";

const Board = ({ width, height, fill }: IconProps) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 3H17M3.5 16H17M9.5 5.56061C6.9548 5.56061 2.5813 5.56061 1.7911 6.25315C1 6.94491 1 7.27188 1 9.5C1 11.7281 1 12.0551 1.7911 12.7468C2.5813 13.4394 3.8548 13.4394 6.4 13.4394H13.6C16.1452 13.4394 17.4187 13.4394 18.2089 12.7468C19 12.0551 19 11.7281 19 9.5C19 7.27188 19 6.94491 18.2089 6.25315C17.4187 5.56061 16.1452 5.56061 13.6 5.56061L8.5 5.56185"
        stroke="#F8FAFC"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Board;
