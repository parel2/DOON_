import { useEffect, useRef, useState } from 'react';
import { formatRupiah } from '../utils/format';

export default function JackpotTicker({ value, className = '' }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    prevValue.current = value;

    return () => cancelAnimationFrame(animRef.current);
  }, [value]);

  return <span className={className}>{formatRupiah(display)}</span>;
}
