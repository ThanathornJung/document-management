'use client';
import { useState, Suspense, lazy } from 'react';
import PageWrapper from '../../components/PageWrapper';
import ConsentModal from '../../components/ConsentModal'; // Import ConsentModal

const LazyRegisterForm = lazy(() => import('../../components/RegisterForm'));

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
        <Suspense fallback={<div>Loading form...</div>}>
          <LazyRegisterForm
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName} setLastName={setLastName}
            birthDate={birthDate} setBirthDate={setBirthDate}
            email={email} setEmail={setEmail}
            tel={tel} setTel={setTel}
            countryCode={countryCode} setCountryCode={setCountryCode}
            username={username} setUsername={setUsername}
            password={password} setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            acceptedConsent={acceptedConsent}
            handleOpenModal={handleOpenModal}
            handleSubmit={handleSubmit}
            message={message}
            isSuccessMessage={isSuccessMessage}
            hasMinLength={hasMinLength} setHasMinLength={setHasMinLength}
            hasUpperCase={hasUpperCase} setHasUpperCase={setHasUpperCase}
            hasLowerCase={hasLowerCase} setHasLowerCase={setHasLowerCase}
            hasSymbol={hasSymbol} setHasSymbol={setHasSymbol}
            passwordStrength={passwordStrength} setPasswordStrength={setPasswordStrength}
          />
        </Suspense>
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