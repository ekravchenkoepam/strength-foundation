import { ComponentProps, forwardRef } from 'react';

type Tint = 'light' | 'neutral' | 'dark';
type Intensity = 'subtle' | 'strong';

type Props = ComponentProps<'div'> & {
  /**
   * 'light'   – translucent white wash (best on dark/photo backdrops)
   * 'neutral' – almost no tint (lets backdrop dominate)
   * 'dark'    – translucent black wash (best on light/busy backdrops where you need text contrast)
   */
  tint?: Tint;
  /**
   * 'subtle' – ~40px displacement (good for small captions/buttons)
   * 'strong' – ~80px displacement (good for hero panels)
   * Has no effect in Safari (see LiquidGlassFilter comments).
   */
  intensity?: Intensity;
};

const TINT_CLASS: Record<Tint, string> = {
  light: 'bg-white/10',
  // Truly transparent — relies on the border + inset highlight + light blur
  // to define the glass surface. Use this when the underlying texture
  // (e.g. asphalt) should show through clearly.
  neutral: 'bg-transparent',
  // Dark sits closer to the design — opaque enough to keep white text crisp
  // on busy photos while still letting the underlying image bleed through
  // and the refraction stay visible at the edges.
  dark: 'bg-black/55',
};

/**
 * iOS 26-style Liquid Glass surface.
 *
 * Renders a div with:
 *  - backdrop blur + saturation boost (frosted-glass base)
 *  - SVG displacement filter (the "lensing" warp — Chromium-only)
 *  - inset top rim highlight + ambient drop shadow
 *  - thin translucent border
 *
 * Browser support:
 *  - Chromium (Chrome, Edge, Arc, Brave, Opera): full effect with refraction.
 *  - Safari / WebKit: gracefully falls back to blur + saturate (no warping)
 *    because Safari does not support url() inside backdrop-filter.
 *  - Firefox: backdrop-filter has only just landed; falls back to the bg tint.
 *
 * Requires <LiquidGlassFilter /> to be present somewhere in the DOM (we render
 * it once in the root layout). If you don't, the url() reference silently
 * resolves to nothing and you get plain frosted glass.
 */
export const LiquidGlass = forwardRef<HTMLDivElement, Props>(function LiquidGlass(
  { tint = 'light', intensity = 'subtle', className = '', children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      data-glass-intensity={intensity}
      className={`liquid-glass border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.08),0_12px_40px_rgba(0,0,0,0.25)] ${TINT_CLASS[tint]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});
