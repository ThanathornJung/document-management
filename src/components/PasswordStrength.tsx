'use client';

interface PasswordStrengthProps {
  passwordStrength: string;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasSymbol: boolean;
}

export default function PasswordStrength({ passwordStrength, hasMinLength, hasUpperCase, hasLowerCase, hasSymbol }: PasswordStrengthProps) {
  return (
    <div className="mt-2">
      <div className="w-full bg-gray-600 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${passwordStrength === 'Weak' ? 'bg-red-500' : passwordStrength === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${passwordStrength === 'Weak' ? '33%' : passwordStrength === 'Medium' ? '66%' : '100%'}` }}
        ></div>
      </div>
      <p className={`text-sm font-press-start mt-1 ${passwordStrength === 'Weak' ? 'text-red-500' : passwordStrength === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
        Strength: {passwordStrength}
      </p>
      <div className="mt-2 text-sm">
        <p className={`font-press-start ${hasMinLength ? 'text-green-500' : 'text-red-500'}`}>
          {hasMinLength ? '✓' : '✗'} Min 8 characters
        </p>
        <p className={`font-press-start ${hasUpperCase ? 'text-green-500' : 'text-red-500'}`}>
          {hasUpperCase ? '✓' : '✗'} Uppercase letter
        </p>
        <p className={`font-press-start ${hasLowerCase ? 'text-green-500' : 'text-red-500'}`}>
          {hasLowerCase ? '✓' : '✗'} Lowercase letter
        </p>
        <p className={`font-press-start ${hasSymbol ? 'text-green-500' : 'text-red-500'}`}>
          {hasSymbol ? '✓' : '✗'} Special symbol
        </p>
      </div>
    </div>
  );
}
