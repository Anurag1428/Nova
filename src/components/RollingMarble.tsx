import React, { useEffect, useRef, useState } from 'react';

interface RollingMarbleProps {
  brandText?: string;
  onBookClick: () => void;
}

/**
 * Bespoke Sculptural Nacre Pearl & Kintsugi Gold Orb for NOVA.
 * Features:
 * - True 3D spherical projection (longitude + latitude curvature) that rolls with
 *   scroll velocity and interactive cursor magnetic physics
 * - Mother-of-pearl iridescent interference layers (rose-champagne + silver-azure nacre)
 * - Kintsugi liquid-gold mineral veins & fine astrolabe meridian filigree wrapped in 3D
 * - Deep-carved "NOVA" sculptural relief with dynamic studio specular bevels
 * - Warm floor caustic bounce light + long studio cyclorama shadow
 * - Interactive "● Hershita" floating cursor follower with magnetic aura
 */
export const RollingMarble: React.FC<RollingMarbleProps> = ({
  brandText = 'NOVA',
  onBookClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const scrollBoostRef = useRef<number>(0);

  const [isPointerInside, setIsPointerInside] = useState(false);
  const [isNearSphere, setIsNearSphere] = useState(false);
  const pointerTargetRef = useRef<{ x: number; y: number } | null>(null);
  const pointerCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseNormRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothMouseNormRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      scrollBoostRef.current = Math.max(-0.08, Math.min(0.08, dy * 0.0022));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-resolution equirectangular surface map (wrapped in 3D over the sphere)
    // Contains: Kintsugi gold veins, astrolabe filigree rings, and carved NOVA relief
    const texW = 1800;
    const texH = 600;
    const texCanvas = document.createElement('canvas');
    texCanvas.width = texW;
    texCanvas.height = texH;
    const tctx = texCanvas.getContext('2d');

    const drawSphericalSurfaceMap = () => {
      if (!tctx) return;
      tctx.clearRect(0, 0, texW, texH);

      // 1. Subtle Organic Alabaster & Kintsugi Gold Veins
      for (let v = 0; v < 6; v++) {
        const isGoldVein = v % 2 === 0;
        tctx.save();
        tctx.beginPath();
        for (let x = 0; x <= texW; x += 12) {
          const phase = (x / texW) * Math.PI * 2;
          const y =
            texH * 0.5 +
            Math.sin(phase + v * 1.05) * (95 + v * 14) +
            Math.cos(phase * 3 - v * 0.7) * 32 +
            Math.sin(phase * 7 + v) * 8;
          if (x === 0) tctx.moveTo(x, y);
          else tctx.lineTo(x, y);
        }
        if (isGoldVein) {
          // Subtle champagne-gold kintsugi seam
          tctx.strokeStyle = 'rgba(188, 154, 96, 0.34)';
          tctx.lineWidth = 1.8;
          tctx.stroke();

          // Bright gold leaf highlight along the vein
          tctx.strokeStyle = 'rgba(255, 246, 220, 0.45)';
          tctx.lineWidth = 0.8;
          tctx.stroke();
        } else {
          // Soft mineral stone vein
          tctx.strokeStyle = 'rgba(120, 110, 98, 0.14)';
          tctx.lineWidth = 1.4;
          tctx.stroke();
        }
        tctx.restore();
      }

      // 2. Sculptural Equatorial Filigree & Astrolabe Tick Marks
      const upperBandY = texH * 0.25;
      const lowerBandY = texH * 0.75;

      tctx.strokeStyle = 'rgba(168, 138, 86, 0.32)';
      tctx.lineWidth = 1;
      tctx.beginPath();
      tctx.moveTo(0, upperBandY);
      tctx.lineTo(texW, upperBandY);
      tctx.moveTo(0, lowerBandY);
      tctx.lineTo(texW, lowerBandY);
      tctx.stroke();

      // Fine degree ticks along the upper and lower latitude rings
      tctx.strokeStyle = 'rgba(42, 36, 30, 0.22)';
      tctx.lineWidth = 1;
      for (let x = 0; x < texW; x += 25) {
        const isMajor = x % 100 === 0;
        const tickLen = isMajor ? 8 : 4;
        tctx.beginPath();
        tctx.moveTo(x, upperBandY - tickLen * 0.5);
        tctx.lineTo(x, upperBandY + tickLen * 0.5);
        tctx.moveTo(x, lowerBandY - tickLen * 0.5);
        tctx.lineTo(x, lowerBandY + tickLen * 0.5);
        tctx.stroke();
      }

      // 3. Carved "N O V A" Wordmark Repeated Around the Sphere Equator
      const spacedBrand = brandText.toUpperCase().split('').join(' ');
      const centers = [texW * 0.25, texW * 0.75];

      for (const cx of centers) {
        // Small micro-coordinates above & below the main carved brand name
        tctx.font = '400 15px "JetBrains Mono", monospace';
        tctx.textAlign = 'center';
        tctx.textBaseline = 'middle';
        tctx.fillStyle = 'rgba(42, 36, 30, 0.48)';
        tctx.fillText('26.75° N · 80.95° E', cx, upperBandY - 22);
        tctx.fillText('SANCTUARY OF BEAUTY', cx, lowerBandY + 24);

        // Main Engraved Brand Wordmark in Cabin Sketch
        tctx.font = '700 104px "Cabin Sketch", cursive, sans-serif';

        // Warm champagne-gold inner bevel highlight (catches studio key light)
        tctx.fillStyle = 'rgba(255, 251, 240, 0.85)';
        tctx.fillText(spacedBrand, cx + 2.2, texH * 0.5 + 2.2);

        // Secondary gold-bronze rim inside the carving
        tctx.fillStyle = 'rgba(176, 142, 84, 0.55)';
        tctx.fillText(spacedBrand, cx - 1.5, texH * 0.5 - 1.5);

        // Deep charcoal-navy carved stone core
        tctx.fillStyle = '#181E34';
        tctx.fillText(spacedBrand, cx, texH * 0.5);
      }

      // 4. Four-Point Starburst Compass Motifs Between Wordmarks (at 0, 0.5, 1.0)
      for (const sx of [0, texW * 0.5, texW]) {
        tctx.save();
        tctx.translate(sx, texH * 0.5);

        // Outer golden ring
        tctx.strokeStyle = 'rgba(176, 142, 84, 0.55)';
        tctx.lineWidth = 1.2;
        tctx.beginPath();
        tctx.arc(0, 0, 22, 0, Math.PI * 2);
        tctx.stroke();

        // 4-point sculptural star
        tctx.fillStyle = '#181E34';
        tctx.beginPath();
        const outerR = 16;
        const innerR = 4.2;
        for (let p = 0; p < 8; p++) {
          const angle = (p * Math.PI) / 4;
          const rad = p % 2 === 0 ? outerR : innerR;
          const px = Math.cos(angle) * rad;
          const py = Math.sin(angle) * rad;
          if (p === 0) tctx.moveTo(px, py);
          else tctx.lineTo(px, py);
        }
        tctx.closePath();
        tctx.fill();
        tctx.restore();
      }
    };

    drawSphericalSurfaceMap();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        drawSphericalSurfaceMap();
      });
    }

    let animationFrameId = 0;
    let timePhase = 0;

    const renderFrame = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(320, rect.height);

      if (
        canvas.width !== Math.floor(width * dpr) ||
        canvas.height !== Math.floor(height * dpr)
      ) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      // Smoothly interpolate normalized mouse coordinates for 3D magnetic tilt & light shift
      smoothMouseNormRef.current.x +=
        (mouseNormRef.current.x - smoothMouseNormRef.current.x) * 0.08;
      smoothMouseNormRef.current.y +=
        (mouseNormRef.current.y - smoothMouseNormRef.current.y) * 0.08;

      const mx = smoothMouseNormRef.current.x;
      const my = smoothMouseNormRef.current.y;

      const R = Math.min(width, height) * 0.215;
      const rollOsc = Math.sin(timePhase * 0.85) * 0.55 + mx * 0.45;
      const cx = width * 0.49 + rollOsc * (width * 0.028);
      const cy = height * 0.52 + my * 6;

      // Update floating "● Hershita" cursor position
      const defaultCursorX = cx + R + 38;
      const defaultCursorY = cy + R * 0.1;
      const targetX = pointerTargetRef.current ? pointerTargetRef.current.x : defaultCursorX;
      const targetY = pointerTargetRef.current ? pointerTargetRef.current.y : defaultCursorY;

      if (pointerCurrentRef.current.x === 0 && pointerCurrentRef.current.y === 0) {
        pointerCurrentRef.current = { x: targetX, y: targetY };
      } else {
        pointerCurrentRef.current.x += (targetX - pointerCurrentRef.current.x) * 0.18;
        pointerCurrentRef.current.y += (targetY - pointerCurrentRef.current.y) * 0.18;
      }

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${pointerCurrentRef.current.x}px, ${pointerCurrentRef.current.y}px, 0)`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Studio Cyclorama Background with Subtle Warm Horizon Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#CFCFCF');
      bgGrad.addColorStop(0.5, '#D5D4D2');
      bgGrad.addColorStop(0.78, '#DAD9D6');
      bgGrad.addColorStop(1, '#E0DFDC');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Interactive Studio Key-Light Spotlight on the Cyclorama Floor
      const lightX = cx + R * (0.85 + mx * 0.35);
      const lightY = cy - R * (0.25 - my * 0.25);
      const floorGlow = ctx.createRadialGradient(
        lightX,
        cy + R * 0.35,
        R * 0.15,
        cx,
        cy + R * 0.3,
        width * 0.52
      );
      floorGlow.addColorStop(0, 'rgba(255, 252, 246, 0.52)');
      floorGlow.addColorStop(0.5, 'rgba(235, 232, 226, 0.18)');
      floorGlow.addColorStop(1, 'rgba(210, 210, 208, 0)');
      ctx.fillStyle = floorGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Long Soft Directional Cast Shadow + Warm Caustic Core on the Left Floor
      ctx.save();
      ctx.translate(cx - R * (1.42 + mx * 0.18), cy + R * 0.42);
      ctx.rotate(0.14 - my * 0.04);
      ctx.scale(2.6, 0.44);
      const longShadowGrad = ctx.createRadialGradient(
        R * 0.55,
        0,
        R * 0.08,
        0,
        0,
        R * 1.7
      );
      longShadowGrad.addColorStop(0, 'rgba(98, 92, 84, 0.46)');
      longShadowGrad.addColorStop(0.4, 'rgba(130, 124, 116, 0.25)');
      longShadowGrad.addColorStop(0.75, 'rgba(168, 164, 158, 0.1)');
      longShadowGrad.addColorStop(1, 'rgba(210, 208, 204, 0)');
      ctx.fillStyle = longShadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, R * 1.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Warm Pearlescent Caustic Bounce Light Just to the Right of the Sphere's Base
      ctx.save();
      ctx.translate(cx + R * 0.55, cy + R * 0.88);
      ctx.scale(1.3, 0.26);
      const causticGrad = ctx.createRadialGradient(0, 0, R * 0.02, 0, 0, R * 0.75);
      causticGrad.addColorStop(0, 'rgba(255, 247, 228, 0.55)');
      causticGrad.addColorStop(0.5, 'rgba(238, 222, 192, 0.22)');
      causticGrad.addColorStop(1, 'rgba(220, 215, 205, 0)');
      ctx.fillStyle = causticGrad;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Tight Contact Ambient Occlusion Directly Under the Sphere
      ctx.save();
      ctx.translate(cx - R * 0.08, cy + R * 0.95);
      ctx.scale(1.05, 0.18);
      const aoGrad = ctx.createRadialGradient(0, 0, R * 0.04, 0, 0, R * 0.88);
      aoGrad.addColorStop(0, 'rgba(32, 27, 22, 0.72)');
      aoGrad.addColorStop(0.52, 'rgba(74, 66, 58, 0.32)');
      aoGrad.addColorStop(1, 'rgba(150, 145, 138, 0)');
      ctx.fillStyle = aoGrad;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.88, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Sculptural Nacre Pearl & Kintsugi Sphere Body
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // 4A. Base 3D Spherical Satin Pearl-Champagne Shading (reacts to cursor light!)
      const specCenterX = cx + R * (0.34 + mx * 0.16);
      const specCenterY = cy - R * (0.18 - my * 0.16);
      const sphereGrad = ctx.createRadialGradient(
        specCenterX,
        specCenterY,
        R * 0.04,
        cx - R * 0.12,
        cy + R * 0.08,
        R * 1.24
      );
      sphereGrad.addColorStop(0, '#FFFDF9');
      sphereGrad.addColorStop(0.22, '#F5F0E6');
      sphereGrad.addColorStop(0.48, '#DDD5C7');
      sphereGrad.addColorStop(0.74, '#B5AB9B');
      sphereGrad.addColorStop(0.91, '#8E8474');
      sphereGrad.addColorStop(1, '#ABA192');
      ctx.fillStyle = sphereGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // 4B. Iridescent Mother-of-Pearl (Nacre) Interference Shimmer
      // Warm Rose-Champagne Nacre Lobe
      const roseNacre = ctx.createRadialGradient(
        cx + R * (0.12 - mx * 0.2),
        cy + R * (0.28 + my * 0.15),
        R * 0.05,
        cx,
        cy,
        R * 0.95
      );
      roseNacre.addColorStop(0, 'rgba(242, 208, 198, 0.26)');
      roseNacre.addColorStop(0.55, 'rgba(226, 195, 210, 0.12)');
      roseNacre.addColorStop(1, 'rgba(200, 190, 180, 0)');
      ctx.fillStyle = roseNacre;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // Cool Silver-Azure Nacre Counter-Lobe
      const azureNacre = ctx.createRadialGradient(
        cx - R * (0.28 - mx * 0.15),
        cy - R * (0.24 - my * 0.15),
        R * 0.05,
        cx - R * 0.1,
        cy - R * 0.1,
        R * 0.88
      );
      azureNacre.addColorStop(0, 'rgba(208, 224, 236, 0.22)');
      azureNacre.addColorStop(0.5, 'rgba(195, 210, 225, 0.08)');
      azureNacre.addColorStop(1, 'rgba(180, 180, 180, 0)');
      ctx.fillStyle = azureNacre;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // 5. True 3D Spherical Projection of the Engraved Wordmark, Kintsugi Veins & Filigree
      ctx.save();
      ctx.translate(cx, cy);
      // Dynamic sculptural axis tilt that responds gently to cursor Y/X
      ctx.rotate(-0.11 + mx * 0.05);

      const cols = 104;
      // Center u=0.25 ("NOVA") at the front of the sphere, rolling smoothly with time, scroll & cursor
      const uCenter = 0.25 + rollOsc * 0.068;

      for (let i = 0; i < cols; i++) {
        const nx0 = (i / cols) * 2 - 1;
        const nx1 = ((i + 1) / cols) * 2 - 1;
        const nxMid = (nx0 + nx1) * 0.5;

        const lon = Math.asin(Math.max(-1, Math.min(1, nxMid)));
        const cosLon = Math.cos(lon);
        if (cosLon <= 0.05) continue;

        const uNorm = (((uCenter + (lon / Math.PI) * 0.35) % 1) + 1) % 1;
        const srcX = Math.floor(uNorm * (texW - 4));
        const srcW = Math.max(2, Math.ceil((texW * 0.35) / cols));

        const destX = nx0 * R;
        const destW = Math.max(1.5, (nx1 - nx0) * R + 0.75);

        // Vertical height compresses toward left/right horizon of the sphere (cos(lon))
        const bandHalfH = R * 0.68 * cosLon;
        // 3D latitude pitch curvature (reacts to cursor Y!)
        const pitchCurveY = Math.pow(nxMid, 2) * (R * (0.09 - my * 0.05)) + my * (R * 0.08) * cosLon;

        ctx.globalAlpha = Math.pow(cosLon, 1.18) * 0.94;

        ctx.drawImage(
          texCanvas,
          srcX,
          0,
          srcW,
          texH,
          destX,
          -bandHalfH + pitchCurveY,
          destW,
          bandHalfH * 2
        );
      }
      ctx.restore();

      // 6. Dual Studio Softbox Specular Highlights (Primary Key Light + Crisp Pinpoint Glint)
      const specGrad = ctx.createRadialGradient(
        specCenterX,
        specCenterY,
        R * 0.015,
        specCenterX - R * 0.06,
        specCenterY + R * 0.06,
        R * 0.55
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.82)');
      specGrad.addColorStop(0.35, 'rgba(255, 253, 248, 0.28)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // Sculptural Gold-Rimmed Crown Aperture at the Top Pole of the Pearl
      const poleX = cx + rollOsc * (R * 0.1);
      const poleY = cy - R * 0.91;
      ctx.strokeStyle = 'rgba(186, 152, 92, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(poleX, poleY, R * 0.09, R * 0.028, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(42, 36, 30, 0.45)';
      ctx.beginPath();
      ctx.ellipse(poleX, poleY, R * 0.075, R * 0.022, 0, 0, Math.PI * 2);
      ctx.fill();

      // 7. Inner Fresnel Rim Light Around the Sphere Circumference
      const rimGrad = ctx.createRadialGradient(cx, cy, R * 0.78, cx, cy, R);
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rimGrad.addColorStop(0.84, 'rgba(255, 252, 245, 0.06)');
      rimGrad.addColorStop(0.95, 'rgba(255, 250, 240, 0.28)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.52)');
      ctx.fillStyle = rimGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      ctx.restore(); // end sphere clip

      // Delicate outer champagne-gold aura ring when cursor is near the sphere
      ctx.strokeStyle = 'rgba(160, 152, 140, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Advance roll phase smoothly + decay scroll boost
      timePhase += 0.013 + scrollBoostRef.current;
      scrollBoostRef.current *= 0.91;

      animationFrameId = window.requestAnimationFrame(renderFrame);
    };

    renderFrame();
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [brandText]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointerTargetRef.current = { x, y };

    const nx = ((x / Math.max(1, rect.width)) - 0.5) * 2;
    const ny = ((y / Math.max(1, rect.height)) - 0.5) * 2;
    mouseNormRef.current = { x: nx, y: ny };

    const distFromCenter = Math.hypot(x - rect.width * 0.49, y - rect.height * 0.52);
    const rApprox = Math.min(rect.width, rect.height) * 0.25;
    setIsNearSphere(distFromCenter <= rApprox);

    if (!isPointerInside) setIsPointerInside(true);
  };

  const handleMouseLeave = () => {
    setIsPointerInside(false);
    setIsNearSphere(false);
    pointerTargetRef.current = null;
    mouseNormRef.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label="Hershita — Begin your tailored journey"
      onClick={onBookClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onBookClick();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPointerInside(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative h-[66vh] min-h-[460px] max-h-[700px] w-full overflow-hidden bg-[#D4D3D0] select-none focus-visible:outline-2 focus-visible:outline-[#18224B] ${
        isPointerInside ? 'lg:cursor-none' : 'cursor-pointer'
      }`}
    >
      <canvas
        ref={canvasRef}
        aria-label={`Rolling pearlescent marble engraved with ${brandText}`}
        className="block h-full w-full"
      />

      {/* Custom Floating Cursor Follower ("● Hershita") with Magnetic Aura */}
      <div
        ref={cursorDotRef}
        data-testid="marble-cursor-follower"
        className="pointer-events-none absolute left-0 top-0 z-20 -translate-y-1/2 flex items-center gap-2.5 whitespace-nowrap will-change-transform"
      >
        <span className="relative flex items-center justify-center">
          <span
            aria-hidden="true"
            className={`absolute rounded-full border border-white/60 transition-all duration-300 ${
              isNearSphere ? 'h-5 w-5 opacity-100 scale-110' : 'h-2 w-2 opacity-0 scale-50'
            }`}
          />
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
          />
        </span>
        <span className="font-basel text-[13.5px] font-normal tracking-[-0.01em] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.18)]">
          Hershita
        </span>
      </div>
    </div>
  );
};
