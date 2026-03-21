import React from 'react';

const SpeedLines = () => {
  // Gerar algumas linhas com posições e velocidades aleatórias
  const lines = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    duration: `${0.8 + Math.random() * 1.2}s`,
    delay: `${Math.random() * 3}s`,
    opacity: 0.1 + Math.random() * 0.4,
    width: `${100 + Math.random() * 200}px`
  }));

  return (
    <>
      <div className="carbon-overlay"></div>
      <div className="speed-lines-container">
        {lines.map((line) => (
          <div
            key={line.id}
            className="speed-line"
            style={{
              top: line.top,
              animationDuration: line.duration,
              animationDelay: line.delay,
              opacity: line.opacity,
              width: line.width
            }}
          />
        ))}
      </div>
    </>
  );
};

export default SpeedLines;
