'use client';
import PasswordStrength from './PasswordStrength'; // Import the new component

interface RegisterFormProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  birthDate: string;
  setBirthDate: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  tel: string;
  setTel: (value: string) => void;
  countryCode: string;
  setCountryCode: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  acceptedConsent: boolean;
  handleOpenModal: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  message: string;
  isSuccessMessage: boolean;
  // Setters for password strength states
  setHasMinLength: (value: boolean) => void;
  setHasUpperCase: (value: boolean) => void;
  setHasLowerCase: (value: boolean) => void;
  setHasSymbol: (value: boolean) => void;
  setPasswordStrength: (value: string) => void;
  // Values for password strength states
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasSymbol: boolean;
  passwordStrength: string;
}

export default function RegisterForm({
  firstName, setFirstName, lastName, setLastName, birthDate, setBirthDate,
  email, setEmail, tel, setTel, countryCode, setCountryCode, username, setUsername,
  password, setPassword, confirmPassword, setConfirmPassword, acceptedConsent,
  handleOpenModal, handleSubmit, message, isSuccessMessage,
  setHasMinLength, setHasUpperCase, setHasLowerCase, setHasSymbol, setPasswordStrength,
  hasMinLength, hasUpperCase, hasLowerCase, hasSymbol, passwordStrength
}: RegisterFormProps) {

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Check conditions
    const minLength = newPassword.length >= 8;
    const upperCase = /[A-Z]/.test(newPassword);
    const lowerCase = /[a-z]/.test(newPassword);
    const symbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    setHasMinLength(minLength);
    setHasUpperCase(upperCase);
    setHasLowerCase(lowerCase);
    setHasSymbol(symbol);

    // Determine strength
    let strength = 0;
    if (minLength) strength++;
    if (upperCase) strength++;
    if (lowerCase) strength++;
    if (symbol) strength++;

    if (strength === 4) {
      setPasswordStrength('Strong');
    } else if (strength >= 2) {
      setPasswordStrength('Medium');
    } else {
      setPasswordStrength('Weak');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="md:col-span-1">
          <label htmlFor="firstName" className="block text-gray-700 font-semibold mb-2">First Name</label>
          <input
            type="text"
            id="firstName"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-1">
          <label htmlFor="lastName" className="block text-gray-700 font-semibold mb-2">Last Name</label>
          <input
            type="text"
            id="lastName"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="birthDate" className="block text-gray-700 font-semibold mb-2">Birth Date</label>
          <input
            type="date"
            id="birthDate"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max="9999-12-31"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="tel" className="block text-gray-700 font-semibold mb-2">Telephone</label>
          <div className="flex flex-col sm:flex-row">
            <select
              id="countryCode"
              className="px-4 py-3 border border-gray-300 rounded-lg sm:rounded-r-none bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-0 sm:mr-0"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="+66">+66 (TH)</option>
              <option value="+1">+1 (US)</option>
              {/* Add more country codes as needed */}
            </select>
            <input
              type="tel"
              id="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg sm:rounded-l-none bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tel}
              onChange={(e) => setTel(e.target.value.replace(/\D/g, ''))} // Filter non-digits
              pattern="[0-9]*"
              inputMode="numeric"
              required
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">Username</label>
          <input
            type="text"
            id="username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <PasswordStrength
            passwordStrength={passwordStrength}
            hasMinLength={hasMinLength}
            hasUpperCase={hasUpperCase}
            hasLowerCase={hasLowerCase}
            hasSymbol={hasSymbol}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="mt-6 mb-6 flex items-center">
        <input
          type="checkbox"
          id="acceptedConsent"
          className="form-checkbox h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          checked={acceptedConsent}
          disabled={!acceptedConsent}
          onClick={handleOpenModal}
          required
        />
        <label htmlFor="acceptedConsent" className="ml-3 text-gray-800 font-semibold cursor-pointer" onClick={handleOpenModal}>I accept the terms and conditions</label>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white py-3 px-8 shadow-lg hover:bg-blue-700 transition-colors w-full rounded-lg text-lg font-semibold"
      >
        Register
      </button>
      {message && <p className={`text-center mt-4 font-semibold ${isSuccessMessage ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
    </form>
  );
}