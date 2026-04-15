import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  fire: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ fire }) => {
  useEffect(() => {
    if (!fire) return;

    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#7C6FE9', '#34D399', '#F59E0B', '#EC4899', '#3B82F6'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Big burst at the start
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors,
    });
  }, [fire]);

  return null;
};

export default Confetti;