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
      <div className="mb-4">
        <label htmlFor="firstName" className="block text-yellow-400 font-press-start mb-2">First Name</label>
        <input
          type="text"
          id="firstName"
          className="w-full px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="lastName" className="block text-yellow-400 font-press-start mb-2">Last Name</label>
        <input
          type="text"
          id="lastName"
          className="w-full px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="birthDate" className="block text-yellow-400 font-press-start mb-2">Birth Date</label>
        <input
          type="date"
          id="birthDate"
          className="w-full px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max="9999-12-31"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-yellow-400 font-press-start mb-2">Email</label>
        <input
          type="email"
          id="email"
          className="w-full px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tel" className="block text-yellow-400 font-press-start mb-2">Telephone</label>
        <div className="flex">
          <select
            id="countryCode"
            className="px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 mr-2"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            <option value="+66">+66 (TH)</option>
            <option value="+1">+1 (US)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+91">+91 (IN)</option>
            <option value="+61">+61 (AU)</option>
            <option value="+86">+86 (CN)</option>
            <option value="+81">+81 (JP)</option>
            <option value="+49">+49 (DE)</option>
            <option value="+33">+33 (FR)</option>
            <option value="+39">+39 (IT)</option>
            <option value="+34">+34 (ES)</option>
            <option value="+7">+7 (RU)</option>
            <option value="+55">+55 (BR)</option>
            <option value="+52">+52 (MX)</option>
            <option value="+27">+27 (ZA)</option>
            {/* Add more country codes as needed */}
          </select>
          <input
            type="tel"
            id="tel"
            className="w-full px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={tel}
            onChange={(e) => setTel(e.target.value.replace(/\D/g, ''))} // Filter non-digits
            pattern="[0-9]*" // Allow only digits
            inputMode="numeric" // Hint for numeric keyboard on mobile
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="username" className="block text-yellow-400 font-press-start mb-2">Username</label>
        <input
          type="text"
          id="username"
          className="w-full px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-yellow-400 font-press-start mb-2">Password</label>
        <input
          type="password"
          id="password"
          className="w-full px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={password}
          onChange={handlePasswordChange} // Call new handler
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
      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-yellow-400 font-press-start mb-2">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          className="w-full px-3 py-2 border border-gray-600 rounded-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-6 flex items-center">
        <input
          type="checkbox"
          id="acceptedConsent"
          className="form-checkbox h-5 w-5 text-yellow-400 bg-gray-700 border-gray-600 rounded-none focus:ring-yellow-400"
          checked={acceptedConsent}
          disabled={!acceptedConsent} // Disable checkbox until accepted via modal
          onClick={handleOpenModal} // Open modal on click
          required
        />
        <label htmlFor="acceptedConsent" className="ml-2 text-white font-press-start cursor-pointer" onClick={handleOpenModal}>I accept the terms and conditions</label>
      </div>
      <button
        type="submit"
        className="bg-yellow-500 text-gray-900 font-press-start py-3 px-8 shadow-lg hover:bg-yellow-400 transition-colors w-full"
      >
        Register
      </button>
      {message && <p className={`text-center mt-4 font-press-start ${isSuccessMessage ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
    </form>
  );
}