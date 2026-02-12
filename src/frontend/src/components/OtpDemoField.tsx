import { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface OtpDemoFieldProps {
  onVerified: (verified: boolean) => void;
}

export default function OtpDemoField({ onVerified }: OtpDemoFieldProps) {
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [userOtp, setUserOtp] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string>('');

  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setUserOtp('');
    setIsVerified(false);
    setError('');
    onVerified(false);
  };

  const handleOtpChange = (value: string) => {
    setUserOtp(value);
    setError('');
    
    if (value.length === 6) {
      if (value === generatedOtp) {
        setIsVerified(true);
        onVerified(true);
      } else {
        setError('Invalid OTP. Please try again.');
        onVerified(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={generateOtp}
          className="px-4 py-2 text-sm font-medium rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Generate OTP
        </button>
        {generatedOtp && (
          <div className="px-4 py-2 bg-accent/50 rounded text-sm font-mono">
            Demo OTP: <span className="font-bold text-primary">{generatedOtp}</span>
          </div>
        )}
      </div>

      {generatedOtp && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Enter OTP</label>
          <InputOTP maxLength={6} value={userOtp} onChange={handleOtpChange}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {isVerified && (
            <p className="text-sm text-primary font-medium">✓ OTP Verified Successfully</p>
          )}
        </div>
      )}
    </div>
  );
}

