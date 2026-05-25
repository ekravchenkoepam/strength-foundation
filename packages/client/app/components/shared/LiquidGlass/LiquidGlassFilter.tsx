export const LiquidGlassFilter = () => (
  <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
    <defs>
      <filter id="liquid-glass-subtle" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="2" seed="17" result="turbulence" />
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softNoise" />
        <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="40" xChannelSelector="R" yChannelSelector="G" />
      </filter>

      <filter id="liquid-glass-strong" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.01" numOctaves="2" seed="42" result="turbulence" />
        <feGaussianBlur in="turbulence" stdDeviation="4" result="softNoise" />
        <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="80" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);
