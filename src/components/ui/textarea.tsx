import {
  formInputBaseClass,
  formInputInvalidClass,
} from "@/lib/form-input-classes";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function Textarea({ invalid = false, className = "", ...props }: Props) {
  return (
    <textarea
      {...props}
      className={`${formInputBaseClass} ${invalid ? formInputInvalidClass : ""} ${className}`}
    />
  );
}
