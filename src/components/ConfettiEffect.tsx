
import React, { useEffect, useState } from 'react';

const generateConfetti = (count: number) => {
  const colors = ['#0056D6', '#00C896', '#FFCC00', '#FF6B6B'];
  const confetti = [];
  
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const animationDuration = 3 + Math.random() * 2;
    const size = 5 + Math.random() * 15;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    confetti.push({
      id: i,
      left: `${left}vw`,
      size: `${size}px`,
      color,
      animationDuration: `${animationDuration}s`,
      animationDelay: `${Math.random() * 0.5}s`
    });
  }
  
  return confetti;
};

const ConfettiEffect = () => {
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    left: string;
    size: string;
    color: string;
    animationDuration: string;
    animationDelay: string;
  }>>([]);
  
  useEffect(() => {
    setConfetti(generateConfetti(100));
    
    // Clean up confetti after animation completes
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="confetti-container">
      {confetti.map(particle => (
        <div
          key={particle.id}
          className="confetti animate-confetti"
          style={{
            left: particle.left,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            animationDuration: particle.animationDuration,
            animationDelay: particle.animationDelay
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;
