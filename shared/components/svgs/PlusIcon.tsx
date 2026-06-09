import { IconProps } from "../../types/icon-svg";

const PlusIcon = ({ width, height, fill }: IconProps) => {
  return (
<svg width={ width ||"20"}
 height={height ||"20" }
 viewBox="0 0 20 20" 
 fill="none" 
 xmlns="http://www.w3.org/2000/svg">
<path d="M4.16699 10H15.8337M10.0003 15.8334V4.16669" 
stroke={fill || "#ffffff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

  );
};

export default PlusIcon;