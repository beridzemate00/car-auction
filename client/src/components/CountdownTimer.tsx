import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  endsAt: string; // ISO string
}

function getTimeLeft(endsAt: string) {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return { expired: true, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { expired: false, hours, minutes, seconds };
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
    return <span className="timer timer-ended">Ended</span>;
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span className="timer">
      {pad(state.hours)}:{pad(state.minutes)}:{pad(state.seconds)}
    </span>
  );
};

export default CountdownTimer;
