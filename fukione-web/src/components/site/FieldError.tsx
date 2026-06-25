interface FieldErrorProps {
  /** Element id, referenced by the field's aria-describedby. */
  id: string;
  /** Error message; renders nothing when absent. */
  message?: string;
}

/** Inline, accessible form-field error message. */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[12px] font-semibold text-red-600">
      {message}
    </p>
  );
}
