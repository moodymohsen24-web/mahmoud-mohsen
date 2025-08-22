import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';

const ProgressLoader: React.FC = () => {
  const { t } = useI18n();
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    let frameId: number;
    let startTimestamp: number | null = null;
    
    const totalDuration = 5000; // 5 seconds feels good for this curve

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / totalDuration, 1);

      // A more balanced ease-in-out function for a professional feel.
      // Starts slow, speeds up, then slows down again.
      const easedProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      const currentPercentage = Math.floor(easedProgress * 99);
      
      setPercentage(currentPercentage);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setPercentage(99);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);
  
  const totalSegments = 12;
  const filledSegments = Math.ceil((percentage / 100) * totalSegments);

  // SVG parameters
  const viewBoxSize = 120;
  const center = viewBoxSize / 2;
  const radius = 50;
  const segmentWidth = 12;
  
  const angle = 360 / totalSegments;
  const gapDegrees = 4;
  const segmentAngle = angle - gapDegrees;
  
  const startAngle = -90 - (segmentAngle / 2);
  const endAngle = startAngle + segmentAngle;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + (r * Math.cos(angleInRadians)),
      y: centerY + (r * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, r: number, startAng: number, endAng: number) => {
    const start = polarToCartesian(x, y, r, endAng);
    const end = polarToCartesian(x, y, r, startAng);
    const largeArcFlag = endAng - startAng <= 180 ? "0" : "1";
    const d = [
        "M", start.x, start.y, 
        "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;
  }

  return (
    <>
      <style>{`
        @keyframes subtle-pulse-kf {
          50% { transform: scale(1.03); }
        }
      `}</style>
      <div className="flex flex-col justify-center items-center h-full text-text-secondary dark:text-dark-text-secondary gap-4 py-4">
        <div 
          className="relative w-32 h-32"
          style={{ animation: 'subtle-pulse-kf 2.5s ease-in-out infinite' }}
        >
          <svg
            height="100%"
            width="100%"
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          >
              {Array.from({ length: totalSegments }).map((_, index) => {
                  const isFilled = index < filledSegments;
                  const rotation = index * angle;
                  return (
                      <path
                          key={index}
                          d={describeArc(center, center, radius, startAngle, endAngle)}
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth={segmentWidth}
                          className={isFilled ? 'text-highlight dark:text-dark-highlight' : 'text-accent dark:text-dark-accent'}
                          transform={`rotate(${rotation} ${center} ${center})`}
                          style={{ transition: 'color 0.3s ease-in-out' }}
                      />
                  );
              })}
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-highlight dark:text-dark-highlight tabular-nums">
            {percentage}%
          </span>
        </div>
        <p className="text-lg font-medium">{t('textCheck.button.processing')}</p>
      </div>
    </>
  );
};

export default ProgressLoader;
