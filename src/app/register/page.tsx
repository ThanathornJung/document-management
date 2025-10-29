'use client';
import { useState } from 'react';
import PageWrapper from '../../components/PageWrapper';
import ConsentModal from '../../components/ConsentModal'; // Import ConsentModal

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [countryCode, setCountryCode] = useState('+66');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedConsent, setAcceptedConsent] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Password strength states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasSymbol, setHasSymbol] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('Weak'); // Weak, Medium, Strong

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAcceptConsent = () => {
    setAcceptedConsent(true);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      setIsSuccessMessage(false);
      return;
    }
    if (!acceptedConsent) {
      setMessage('Please accept the terms and conditions!');
      setIsSuccessMessage(false);
      return;
    }
    // Check password strength before submission
    if (passwordStrength === 'Weak') {
      setMessage('Password is too weak. Please meet all conditions.');
      setIsSuccessMessage(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, birthDate, email, tel: countryCode + tel, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Registration successful!');
        setIsSuccessMessage(true);
        // Optionally redirect to login page
        // router.push('/login');
      } else {
        setMessage(data.message || 'Registration failed.');
        setIsSuccessMessage(false);
      }
    } catch (error) {
      console.error('Registration API error:', error);
      setLocalError('An unexpected error occurred during registration. Please try again.');
      setIsSuccessMessage(false);
      setMessage('');
    }
  };

  const termsAndConditionsContent = (
    <>
      <p className="mb-2">Welcome to our document management system. By registering, you agree to the following terms and conditions:</p>
      <p className="mb-2">1. &quot;**Data Privacy:**&quot; We collect and store your personal information (name, email, etc.) solely for the purpose of providing our services. Your data will not be shared with third parties without your explicit consent, except as required by law.</p>
      <p className="mb-2">2. **Account Security:** You are responsible for maintaining the confidentiality of your account credentials. Please use a strong, unique password and notify us immediately of any unauthorized access.</p>
      <p className="mb-2">3. **Content Ownership:** You retain ownership of all documents you upload to our system. We will not access, use, or distribute your content without your permission, except for operational purposes (e.g., backups, technical support).</p>
      <p className="mb-2">4. **Acceptable Use:** You agree not to use our service for any illegal, harmful, or abusive activities. This includes, but is not limited to, uploading malicious software, infringing on intellectual property rights, or harassing other users.</p>
      <p className="mb-2">5. **Service Availability:** We strive to provide a reliable service, but we do not guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect service availability.</p>
      <p className="mb-2">6. **Changes to Terms:** We reserve the right to update these terms and conditions at any time. We will notify you of significant changes, and your continued use of the service constitutes acceptance of the revised terms.</p>
      <p className="mb-2">7. **Termination:** We may terminate or suspend your account if you violate these terms or engage in activities that harm our service or other users.</p>
      <p className="mb-2">8. **Limitation of Liability:** Our liability for any damages arising from your use of the service is limited to the extent permitted by law.</p>
      <p className="mb-2">9. **Governing Law:** These terms are governed by the laws of [Your Jurisdiction].</p>
      <p className="mb-2">By clicking &quot;Accept&quot;, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
    </>
  );

  return (
    <PageWrapper>
      {localError && <p className="text-center mt-4 text-red-500 font-press-start">{localError}</p>}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-press-start leading-tight mb-8 text-center text-yellow-400">Register</h1>
      <div className="bg-gray-800 bg-opacity-75 p-6 sm:p-8 rounded-lg shadow-lg max-w-lg mx-auto">
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
            </div>
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
      </div>
      <ConsentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAccept={handleAcceptConsent}
      >
        {termsAndConditionsContent}
      </ConsentModal>
    </PageWrapper>
  );
}

