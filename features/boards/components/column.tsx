import Add from "@/shared/components/svgs/Add";

interface ColumnProps {
  title: string;
  cardsCount?: number;
  icon?: string;
  className?: string;
}

const Column = ({ title, cardsCount, icon, className }: ColumnProps) => {
  return (
    <div
      className={` border rounded-[12px] min-w-75 border-gray-50 ${className}`}
    >
      <div>
        <div>
          {icon?.trim() ? <span aria-hidden>{icon.trim()}</span> : null}{" "}
          {<span>{title}</span>}
          {<span>{cardsCount}</span>}
        </div>
        <div>
          <Add />
        </div>
      </div>
    </div>
  );
};

export default Column;
