import { useEffect, useRef } from "react";

interface ConfettiShowerProps {
  /** "continuous" for infinite backdrop loop, "burst" for a single fall-and-fade animation */
  mode?: "continuous" | "burst";
  /** Callback triggered when the burst animation finishes */
  onComplete?: () => void;
  /** Maximum frame count before terminating burst animations */
  maxFrames?: number;
}

const TAKEOVER_CANVAS_STYLE: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  pointerEvents: "none",
  zIndex: 9999,
};

const colors = ["#ff2d55", "#ff9500", "#ffcc00", "#14F195", "#007aff", "#5856d6", "#9945FF", "#38BDF8"];

class Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle";
  opacity: number;

  constructor(width: number, height: number, mode: "continuous" | "burst") {
    this.x = Math.random() * width;
    this.y = mode === "burst"
      ? Math.random() * height - height - 50
      : -20 - Math.random() * 50;
    this.size = Math.random() * 8 + 6;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.speedY = mode === "burst"
      ? Math.random() * 8 + 4
      : Math.random() * 3 + 2.5;
    this.speedX = mode === "burst"
      ? Math.random() * 6 - 3
      : Math.random() * 1.5 - 0.75;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = mode === "burst"
      ? (Math.random() * 4 - 2) * (Math.PI / 180)
      : Math.random() * 0.05 + 0.02;
    this.shape = Math.random() > 0.5 ? "rect" : "circle";
    this.opacity = 1;
  }

  update(width: number, height: number, mode: "continuous" | "burst"): boolean {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;

    if (mode === "continuous") {
      if (this.y > height + 20) {
        this.x = Math.random() * width;
        this.y = -20;
        this.rotation = Math.random() * Math.PI * 2;
      }
      return true;
    } else {
      // burst mode
      if (this.y > height) {
        this.opacity -= 0.015;
      }
      return this.opacity > 0;
    }
  }

  draw(c: CanvasRenderingContext2D) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.rotation);
    c.fillStyle = this.color;
    c.globalAlpha = Math.max(0, this.opacity);
    if (this.shape === "circle") {
      c.beginPath();
      c.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      c.fill();
    } else {
      c.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);
    }
    c.restore();
  }
}

export default function ConfettiShower({ mode = "continuous", onComplete, maxFrames = 300 }: ConfettiShowerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particleCount = mode === "burst" ? 180 : 65;
    const particles = Array.from({ length: particleCount }).map(() => new Particle(width, height, mode));

    let frames = 0;
    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      let anyActive = false;

      particles.forEach((p) => {
        const isAlive = p.update(width, height, mode);
        if (isAlive) {
          anyActive = true;
          p.draw(ctx);
        }
      });

      frames++;
      if (mode === "continuous" || (anyActive && frames < maxFrames)) {
        animationFrameId = requestAnimationFrame(loop);
      } else {
        if (onComplete) {
          onComplete();
        }
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mode, onComplete, maxFrames]);

  return <canvas ref={canvasRef} style={TAKEOVER_CANVAS_STYLE} />;
}
