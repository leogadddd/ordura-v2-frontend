import { PropsWithChildren, useState } from "react";

interface TooltipProps extends PropsWithChildren {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-60 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${positionClasses[position]}`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === "top"
                ? "-bottom-1 left-1/2 -translate-x-1/2"
                : position === "bottom"
                ? "-top-1 left-1/2 -translate-x-1/2"
                : position === "left"
                ? "-right-1 top-1/2 -translate-y-1/2"
                : "-left-1 top-1/2 -translate-y-1/2"
            }`}
          />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
