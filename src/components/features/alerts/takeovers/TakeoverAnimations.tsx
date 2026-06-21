import { useEffect, useRef } from "react";

const TAKEOVER_CANVAS_STYLE: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  pointerEvents: "none",
  zIndex: 9999,
  background: "transparent",
};

// ============================================================================
// 1. Cherry Blossom Shower
// ============================================================================
export function CherryBlossomShower() {
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

    // Pre-render a single petal on offscreen canvas for better performance
    const petalCanvas = document.createElement("canvas");
    petalCanvas.width = 30;
    petalCanvas.height = 30;
    const pCtx = petalCanvas.getContext("2d");
    if (pCtx) {
      pCtx.beginPath();
      pCtx.moveTo(15, 0);
      pCtx.bezierCurveTo(5, 5, 0, 15, 5, 25);
      pCtx.bezierCurveTo(10, 30, 20, 30, 25, 25);
      pCtx.bezierCurveTo(30, 15, 25, 5, 15, 0);
      
      const grad = pCtx.createLinearGradient(0, 0, 30, 30);
      grad.addColorStop(0, "#ffb7c5");
      grad.addColorStop(1, "#ffa0b4");
      
      pCtx.fillStyle = grad;
      pCtx.fill();
    }

    class Petal {
      x: number;
      y: number;
      size: number;
      speed: number;
      sway: number;
      swaySpeed: number;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = -20 - Math.random() * 50;
        this.size = Math.random() * 14 + 8;
        this.speed = Math.random() * 2 + 1.5;
        this.sway = Math.random() * Math.PI;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.02 - 0.01;
      }

      update() {
        this.y += this.speed;
        this.x += Math.sin(this.sway) * 0.8;
        this.sway += this.swaySpeed;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 20) {
          this.x = Math.random() * width;
          this.y = -20;
          this.sway = Math.random() * Math.PI;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        c.globalAlpha = 0.9;
        c.drawImage(petalCanvas, -this.size / 2, -this.size / 2, this.size, this.size);
        c.restore();
      }
    }

    const petals = Array.from({ length: 40 }).map(() => new Petal());

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      petals.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={TAKEOVER_CANVAS_STYLE} />;
}

// ============================================================================
// 2. Gentle Snowfall
// ============================================================================
export function GentleSnowfall() {
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

    class Flake {
      x: number;
      y: number;
      size: number;
      speed: number;
      sway: number;
      swaySpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = -20 - Math.random() * 50;
        this.size = Math.random() * 6 + 4;
        this.speed = Math.random() * 1.5 + 1.0;
        this.sway = Math.random() * Math.PI;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.y += this.speed;
        this.x += Math.sin(this.sway) * 0.5;
        this.sway += this.swaySpeed;

        if (this.y > height + 20) {
          this.x = Math.random() * width;
          this.y = -20;
          this.sway = Math.random() * Math.PI;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = "rgba(255, 255, 255, 0.85)";
        c.fill();
        c.restore();
      }
    }

    const flakes = Array.from({ length: 50 }).map(() => new Flake());

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      flakes.forEach((f) => {
        f.update();
        f.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={TAKEOVER_CANVAS_STYLE} />;
}

// ============================================================================
// 3. Fireworks Shower
// ============================================================================
export function FireworksShower() {
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

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      decay: number;
      color: string;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1.0;
        this.decay = Math.random() * 0.02 + 0.015;
        this.color = color;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // gravity
        this.alpha -= this.decay;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, 3, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
      }
    }

    class Firework {
      x: number;
      y: number;
      targetY: number;
      vy: number;
      exploded: boolean;
      color: string;
      particles: Particle[];

      constructor() {
        this.x = Math.random() * (width - 200) + 100;
        this.y = height;
        this.targetY = Math.random() * (height / 2);
        this.vy = -(Math.random() * 6 + 10);
        this.exploded = false;
        const colors = ["#ff2d55", "#ff9500", "#ffcc00", "#14F195", "#007aff", "#5856d6", "#ff2d55"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.particles = [];
      }

      update() {
        if (!this.exploded) {
          this.y += this.vy;
          this.vy += 0.15;
          if (this.vy >= 0 || this.y <= this.targetY) {
            this.exploded = true;
            for (let i = 0; i < 60; i++) {
              this.particles.push(new Particle(this.x, this.y, this.color));
            }
          }
        } else {
          this.particles.forEach((p) => p.update());
          this.particles = this.particles.filter((p) => p.alpha > 0);
        }
      }

      draw(c: CanvasRenderingContext2D) {
        if (!this.exploded) {
          c.save();
          c.beginPath();
          c.arc(this.x, this.y, 4, 0, Math.PI * 2);
          c.fillStyle = this.color;
          c.fill();
          c.restore();
        } else {
          this.particles.forEach((p) => p.draw(c));
        }
      }
    }

    const fireworks: Firework[] = [];
    let spawnTimer = 0;

    const loop = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(0, 0, width, height);

      spawnTimer++;
      if (spawnTimer > 25) {
        fireworks.push(new Firework());
        spawnTimer = 0;
      }

      fireworks.forEach((f) => {
        f.update();
        f.draw(ctx);
      });

      for (let i = fireworks.length - 1; i >= 0; i--) {
        if (fireworks[i].exploded && fireworks[i].particles.length === 0) {
          fireworks.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={TAKEOVER_CANVAS_STYLE} />;
}

// ============================================================================
// 4. Matrix Code Rain
// ============================================================================
export function MatrixCodeRain() {
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

    const columns = Math.floor(width / 20) + 1;
    const ypos = Array(columns).fill(0);

    const matrixChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテト".split("");

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // throttle to 30 FPS for matrix style

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#14F195";
      ctx.font = "15pt monospace";

      ypos.forEach((y, index) => {
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = index * 20;
        ctx.fillText(text, x, y);

        if (y > 100 + Math.random() * 10000) {
          ypos[index] = 0;
        } else {
          ypos[index] = y + 20;
        }
      });
    };

    const loop = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(loop);
      
      const elapsed = timestamp - lastTime;
      if (elapsed > fpsInterval) {
        lastTime = timestamp - (elapsed % fpsInterval);
        draw();
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={TAKEOVER_CANVAS_STYLE} />;
}

// ============================================================================
// 5. SOL Coin Shower
// ============================================================================
export function SolCoinShower() {
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

    // Pre-render a beautiful coin on an offscreen canvas
    const coinCanvas = document.createElement("canvas");
    coinCanvas.width = 64;
    coinCanvas.height = 64;
    const cCtx = coinCanvas.getContext("2d");
    if (cCtx) {
      const center = 32;
      const radius = 28;

      // Outer Solana gradient rim
      const grad = cCtx.createLinearGradient(0, 0, 64, 64);
      grad.addColorStop(0, "#9945FF"); // Solana Purple
      grad.addColorStop(0.5, "#14F195"); // Solana Green/Cyan
      grad.addColorStop(1, "#9945FF");

      cCtx.beginPath();
      cCtx.arc(center, center, radius, 0, Math.PI * 2);
      cCtx.fillStyle = grad;
      cCtx.fill();

      // Outer border
      cCtx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      cCtx.lineWidth = 1.5;
      cCtx.stroke();

      // Inner fill (dark obsidian background for logo contrast)
      cCtx.beginPath();
      cCtx.arc(center, center, radius - 3, 0, Math.PI * 2);
      cCtx.fillStyle = "#120c1f";
      cCtx.fill();

      // Inner rim accent line
      cCtx.beginPath();
      cCtx.arc(center, center, radius - 4, 0, Math.PI * 2);
      cCtx.strokeStyle = "rgba(153, 69, 255, 0.4)";
      cCtx.lineWidth = 1;
      cCtx.stroke();

      // Draw glowing Solana logo in center
      cCtx.fillStyle = "#14F195"; // Solana Green/Cyan
      cCtx.shadowColor = "#14F195";
      cCtx.shadowBlur = 4;
      cCtx.shadowOffsetX = 0;
      cCtx.shadowOffsetY = 0;

      const size = 22;
      const w = size;
      const h = size * 0.22;
      const skew = size * 0.25;
      const gap = size * 0.08;
      
      const totalH = 3 * h + 2 * gap;
      const startY = center - totalH / 2;
      const startX = center - (w + skew) / 2;

      // Top bar (slanted right)
      cCtx.beginPath();
      cCtx.moveTo(startX + skew, startY);
      cCtx.lineTo(startX + w + skew, startY);
      cCtx.lineTo(startX + w, startY + h);
      cCtx.lineTo(startX, startY + h);
      cCtx.closePath();
      cCtx.fill();

      // Middle bar (slanted left)
      cCtx.beginPath();
      cCtx.moveTo(startX, startY + h + gap);
      cCtx.lineTo(startX + w, startY + h + gap);
      cCtx.lineTo(startX + w + skew, startY + h * 2 + gap);
      cCtx.lineTo(startX + skew, startY + h * 2 + gap);
      cCtx.closePath();
      cCtx.fill();

      // Bottom bar (slanted right)
      cCtx.beginPath();
      cCtx.moveTo(startX + skew, startY + (h + gap) * 2);
      cCtx.lineTo(startX + w + skew, startY + (h + gap) * 2);
      cCtx.lineTo(startX + w, startY + (h + gap) * 2 + h);
      cCtx.lineTo(startX, startY + (h + gap) * 2 + h);
      cCtx.closePath();
      cCtx.fill();
    }

    class Coin {
      x: number;
      y: number;
      size: number;
      speed: number;
      sway: number;
      swaySpeed: number;
      rotationY: number;
      spinSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = -40 - Math.random() * 50;
        this.size = Math.random() * 20 + 16;
        this.speed = Math.random() * 2.5 + 2.0;
        this.sway = Math.random() * Math.PI;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.rotationY = Math.random() * Math.PI * 2;
        this.spinSpeed = Math.random() * 0.08 + 0.04;
      }

      update() {
        this.y += this.speed;
        this.x += Math.sin(this.sway) * 0.5;
        this.sway += this.swaySpeed;
        this.rotationY += this.spinSpeed;

        if (this.y > height + 40) {
          this.x = Math.random() * width;
          this.y = -40;
          this.sway = Math.random() * Math.PI;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);
        
        // Simulate 3D coin spin using scaleX with cosine
        const scaleX = Math.cos(this.rotationY);
        c.scale(scaleX, 1);
        
        c.globalAlpha = 0.95;
        c.drawImage(coinCanvas, -this.size / 2, -this.size / 2, this.size, this.size);
        c.restore();
      }
    }

    const coins = Array.from({ length: 50 }).map(() => new Coin());

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      coins.forEach((coin) => {
        coin.update();
        coin.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={TAKEOVER_CANVAS_STYLE} />;
}

// ============================================================================
// 6. Floating Hearts
// ============================================================================
export function FloatingHearts() {
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

    const colors = ["#ff2d55", "#ff3b30", "#ff2a6d", "#ff5e7e", "#ff85a2", "#e03b8b"];

    class Heart {
      x: number;
      y: number;
      size: number;
      speed: number;
      sway: number;
      swaySpeed: number;
      color: string;
      alpha: number;
      scale: number;

      constructor(initBottom = false) {
        this.x = Math.random() * width;
        this.y = initBottom ? height + Math.random() * 100 : Math.random() * height;
        this.size = Math.random() * 20 + 12;
        this.speed = -(Math.random() * 2 + 1.5); // move up
        this.sway = Math.random() * Math.PI;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.3 + 0.6;
        this.scale = Math.random() * 0.4 + 0.8;
      }

      update() {
        this.y += this.speed;
        this.x += Math.sin(this.sway) * 0.6;
        this.sway += this.swaySpeed;

        // Calculate opacity based on position (fade out near top)
        if (this.y < height * 0.8) {
          const ratio = this.y / (height * 0.8);
          this.alpha = Math.max(0, ratio * 0.9);
        }

        if (this.y < -40 || this.alpha <= 0) {
          this.x = Math.random() * width;
          this.y = height + 20;
          this.alpha = Math.random() * 0.3 + 0.6;
          this.sway = Math.random() * Math.PI;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.fillStyle = this.color;
        
        c.beginPath();
        const x = this.x;
        const y = this.y;
        const size = this.size * this.scale;
        
        c.moveTo(x, y + size / 4);
        c.bezierCurveTo(x, y - size / 4, x - size / 2, y - size / 4, x - size / 2, y + size / 4);
        c.bezierCurveTo(x - size / 2, y + size * 0.6, x, y + size * 0.8, x, y + size);
        c.bezierCurveTo(x, y + size * 0.8, x + size / 2, y + size * 0.6, x + size / 2, y + size / 4);
        c.bezierCurveTo(x + size / 2, y - size / 4, x, y - size / 4, x, y + size / 4);
        c.fill();
        c.restore();
      }
    }

    const hearts = Array.from({ length: 45 }).map((_, i) => new Heart(i > 10));

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      hearts.forEach((h) => {
        h.update();
        h.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={TAKEOVER_CANVAS_STYLE} />;
}

// ============================================================================
// 7. Flames Shower
// ============================================================================
export function FlamesShower() {
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

    class FlameParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      maxLife: number;
      life: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 20;
        this.vx = Math.random() * 2 - 1.0;
        this.vy = -(Math.random() * 4 + 3.0);
        this.size = Math.random() * 25 + 10;
        this.maxLife = Math.random() * 50 + 40;
        this.life = this.maxLife;

        const r = Math.floor(Math.random() * 55) + 200; // 200-255
        const g = Math.floor(Math.random() * 120);       // 0-120
        const b = 0;
        this.color = `${r}, ${g}, ${b}`;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        if (this.size > 0.5) this.size -= 0.2;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        const alpha = this.life / this.maxLife;
        c.globalAlpha = alpha;
        
        // Fast radial gradient instead of shadowBlur
        const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, `rgba(${this.color}, 1)`);
        grad.addColorStop(0.3, `rgba(${this.color}, 0.8)`);
        grad.addColorStop(0.6, `rgba(${this.color}, 0.3)`);
        grad.addColorStop(1, `rgba(${this.color}, 0)`);

        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = grad;
        c.fill();
        c.restore();
      }
    }

    class EmberParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.vx = Math.random() * 3 - 1.5;
        this.vy = -(Math.random() * 6 + 4.0);
        this.size = Math.random() * 4 + 2;
        this.maxLife = Math.random() * 80 + 60;
        this.life = this.maxLife;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx += Math.sin(this.life * 0.05) * 0.1;
        this.life--;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        const alpha = this.life / this.maxLife;
        c.globalAlpha = alpha;
        
        // Fast radial gradient for ember glow
        const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        grad.addColorStop(0, "#ffdd6b");
        grad.addColorStop(0.5, "#ff7700");
        grad.addColorStop(1, "rgba(255, 119, 0, 0)");

        c.beginPath();
        c.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        c.fillStyle = grad;
        c.fill();
        c.restore();
      }
    }

    const flames: FlameParticle[] = [];
    const embers: EmberParticle[] = [];

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      if (flames.length < 120) {
        flames.push(new FlameParticle());
      }
      if (embers.length < 80) {
        embers.push(new EmberParticle());
      }

      flames.forEach((f) => {
        f.update();
        f.draw(ctx);
      });
      for (let i = flames.length - 1; i >= 0; i--) {
        if (flames[i].life <= 0 || flames[i].size <= 0.5) {
          flames[i] = new FlameParticle();
        }
      }

      embers.forEach((e) => {
        e.update();
        e.draw(ctx);
      });
      for (let i = embers.length - 1; i >= 0; i--) {
        if (embers[i].life <= 0) {
          embers[i] = new EmberParticle();
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={TAKEOVER_CANVAS_STYLE} />;
}
