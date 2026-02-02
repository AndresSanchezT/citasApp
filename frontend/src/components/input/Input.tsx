import React from "react";
import "./Input.css";

interface InputProps {
  label?: string;
  type?: "text" | "email" | "tel" | "date" | "time" | "number" | "password";
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  min?: string; // ← Agregar
  max?: string; // ← Agregar
}

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  autoComplete,
  min, // ← Agregar
  max, // ← Agregar
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field ${error ? "input-field--error" : ""}`}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        min={min} // ← Agregar
        max={max} // ← Agregar
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
