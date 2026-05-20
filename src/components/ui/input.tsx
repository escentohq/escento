import { forwardRef } from "react";

import {
  formInputBaseClass,
  formInputInvalidClass,
} from "@/lib/form-input-classes";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { invalid = false, className = "", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      {...props}
      className={`${formInputBaseClass} ${invalid ? formInputInvalidClass : ""} ${className}`}
    />
  );
});
