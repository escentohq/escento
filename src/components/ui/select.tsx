import { ChevronDown } from "lucide-react";

import {
  formInputBaseClass,
  formInputInvalidClass,
} from "@/lib/form-input-classes";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function Select({ invalid = false, className = "", children, ...props }: Props) {
  return (
    <div className="relative mt-2">
      <select
        {...props}
        className={`${formInputBaseClass.replace("mt-2 ", "")} appearance-none pr-10 ${invalid ? formInputInvalidClass : ""} ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
        aria-hidden
      />
    </div>
  );
}
