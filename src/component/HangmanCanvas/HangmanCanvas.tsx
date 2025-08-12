import React, { useRef, useEffect } from 'react';

interface HangmanCanvasProps {
  mistakes: number;
}

const HangmanCanvas: React.FC<HangmanCanvasProps> = ({ mistakes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // очищение канваса
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // табуретка
    if (mistakes < 6) {
      ctx.beginPath();
      ctx.rect(80, 160, 80, 15);
      ctx.moveTo(85, 175);
      ctx.lineTo(85, 190);
      ctx.moveTo(155, 175);
      ctx.lineTo(155, 190);
      ctx.stroke();
    }

    // человечек
    ctx.beginPath();
    ctx.arc(120, 60, 20, 0, Math.PI * 2); // голова
    ctx.moveTo(120, 80); // тело
    ctx.lineTo(120, 140);
    
    // руки
    if (mistakes >= 6) {
      ctx.moveTo(120, 90); //руки при смерти
      ctx.lineTo(100, 120);  
      ctx.moveTo(120, 90);
      ctx.lineTo(140, 120);  
    } else {
      ctx.moveTo(120, 90); // обычное положение рук
      ctx.lineTo(90, 110);
      ctx.moveTo(120, 90);
      ctx.lineTo(150, 110);
    }
    
    // ноги
    if (mistakes >= 6) {
      ctx.moveTo(120, 140); // ноги при смерти
      ctx.lineTo(105, 170); 
      ctx.moveTo(120, 140);
      ctx.lineTo(135, 170);  
    } else {
      ctx.moveTo(120, 140); // обычное положение ног
      ctx.lineTo(90, 170);
      ctx.moveTo(120, 140);
      ctx.lineTo(150, 170);
    }
    
    ctx.stroke();

    // виселица
    if (mistakes >= 1) {
      ctx.beginPath();
      ctx.moveTo(10, 190);
      ctx.lineTo(180, 190);
      ctx.stroke();
    }

    if (mistakes >= 2) {
      ctx.beginPath();
      ctx.moveTo(30, 190);
      ctx.lineTo(30, 20);
      ctx.stroke();
    }

    if (mistakes >= 3) {
      ctx.beginPath();
      ctx.moveTo(30, 20);
      ctx.lineTo(120, 20);
      ctx.stroke();
    }

    if (mistakes >= 4) {
      ctx.beginPath();
      ctx.moveTo(30, 50);
      ctx.lineTo(80, 20);
      ctx.stroke();
    }

    if (mistakes >= 5) {
      ctx.beginPath();
      ctx.moveTo(120, 20);
      ctx.lineTo(120, 40);
      ctx.stroke();
    }
  }, [mistakes]);

  return <canvas ref={canvasRef} width={200} height={200} />;
};

export default HangmanCanvas;