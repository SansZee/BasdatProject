import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';

export function PageLoader() {
  const { isLoading, setIsLoading } = useLoading();
  const location = useLocation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading on route change
    setIsLoading(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 30;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [location, setIsLoading]);

  useEffect(() => {
    // Complete loading after a short delay
    const timer = setTimeout(() => {
      setProgress(100);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [location, setIsLoading]);

  return (
    <>
      {/* Loading Bar */}
      <div
        className={`fixed top-0 left-0 h-1 bg-accent transition-all duration-300 z-[9999] ${
          isLoading || progress > 0 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: `${progress}%` }}
      />
    </>
  );
}
