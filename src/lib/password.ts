export type PasswordRequirement = {
  id: string;
  label: string;
  met: boolean;
};

export type PasswordStrengthLabel =
  | "Too short"
  | "Weak"
  | "Fair"
  | "Good"
  | "Strong";

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: PasswordStrengthLabel;
  requirements: PasswordRequirement[];
};

export function validatePassword(password: string) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Use at least one letter and one number.";
  }
  return null;
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      id: "length",
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      id: "letter",
      label: "At least one letter",
      met: /[A-Za-z]/.test(password),
    },
    {
      id: "number",
      label: "At least one number",
      met: /[0-9]/.test(password),
    },
  ];
}

export function getPasswordStrength(password: string): PasswordStrength {
  const requirements = getPasswordRequirements(password);

  if (!password || password.length < 4) {
    return { score: 0, label: "Too short", requirements };
  }

  const metCount = requirements.filter((requirement) => requirement.met).length;

  if (metCount === 3) {
    return { score: 4, label: "Strong", requirements };
  }

  if (metCount === 2) {
    return { score: 3, label: "Good", requirements };
  }

  if (metCount === 1) {
    return { score: 2, label: "Fair", requirements };
  }

  return { score: 1, label: "Weak", requirements };
}
