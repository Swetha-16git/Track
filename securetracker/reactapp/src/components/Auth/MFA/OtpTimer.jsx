import React, { useState, useEffect } from 'react';
import './OtpTimer.css';

const OtpTimer = ({ onResend, timer = 60 }) => {
  const [timeLeft, setTimeLeft] = useState(timer);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResend = () => {
    if (canResend) {
      setTimeLeft(timer);
      setCanResend(false);
      if (onResend) {
        onResend();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="otp-timer">
      <span className="timer-text">
        {canResend ? (
          <button 
            type="button" 
            className="resend-btn" 
            onClick={handleResend}
          >
            Resend OTP
          </button>
        ) : (
          <>Resend OTP in {formatTime(timeLeft)}</>
        )}
      </span>
    </div>
  );
};

export default OtpTimer;

