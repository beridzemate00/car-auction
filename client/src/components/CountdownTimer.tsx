// client/src/components/CountdownTimer.tsx
import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  endsAt: string; // ISO string
}

function getTimeLeft(endsAt: string) {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { expired: false, days, hours, minutes, seconds };
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endsAt }) => {
  const [state, setState] = useState(() => getTimeLeft(endsAt));

  useEffect(() => {
    const id = setInterval(() => {
      setState(getTimeLeft(endsAt));
    }, 1000);

    return () => clearInterval(id);
  }, [endsAt]);

  if (state.expired) {
    return (
      <span className="timer timer-ended">
        ⏱️ Ended
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  // Determine urgency level
  const totalHours = state.days * 24 + state.hours;
  const isUrgent = totalHours < 1;
  const isWarning = totalHours < 6 && !isUrgent;

  return (
    <span
      className="timer"
      style={{
        background: isUrgent
          ? 'rgba(239, 68, 68, 0.1)'
          : isWarning
            ? 'rgba(245, 158, 11, 0.1)'
            : 'rgba(37, 99, 235, 0.1)',
        color: isUrgent
          ? 'var(--error)'
          : isWarning
            ? 'var(--warning)'
            : 'var(--primary)',
        padding: '0.35rem 0.75rem',
        borderRadius: '8px',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}
    >
      {isUrgent && '🔥'}
      {state.days > 0 && `${state.days}d `}
      {pad(state.hours)}:{pad(state.minutes)}:{pad(state.seconds)}
    </span>
  );
};

export default CountdownTimer;
