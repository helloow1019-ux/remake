import React, { useEffect, useState } from 'react';

export interface CounterProps {
  value: number;
  durationMs?: number;
  unit?: string;
  className?: string;
}

export const Counter: React.FC<CounterProps> = ({
  value,
  durationMs = 800,
  unit,
  className,
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // If reduced motion preferred, snap immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplay(0);
      return;
    }

    const steps = 24;
    const intervalTime = Math.floor(durationMs / steps);
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value, durationMs]);

  return (
    <span className={className}>
      {display.toLocaleString()}
      {unit && <span className="ml-1 text-sm font-semibold">{unit}</span>}
    </span>
  );
};
