import { IconProps } from "../../types/icon-svg";

const Label = ({ width, height, fill }: IconProps) => {
  return (
    <svg 
    width={width ||"24"}
     height={height ||"24"} 
     viewBox="0 0 24 24"
      className={className}
      fill={ "none"} xmlns="http://www.w3.org/2000/svg">
      <path d="M8.01911 7.55211L7.31211 6.84511M10.9801 20.1941L3.68211 12.8961C3.31211 12.5261 3.10211 12.0261 3.09511 11.5041L3.00011 4.01511C2.99809 3.88126 3.02296 3.74837 3.07325 3.62431C3.12355 3.50025 3.19824 3.38755 3.29289 3.29289C3.38755 3.19824 3.50025 3.12355 3.62431 3.07325C3.74837 3.02296 3.88126 2.99809 4.01511 3.00011L11.5041 3.09511C12.027 3.10128 12.5267 3.31199 12.8961 3.68211L20.1941 10.9801C20.8681 11.6531 21.3861 12.9391 20.6181 13.7071L13.7081 20.6171C12.9391 21.3861 11.6531 20.8671 10.9801 20.1941Z"
       stroke={fill || "#0F172A"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

  );
};

export default Label;
