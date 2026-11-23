export function BrandMark() {
  return (
    <>
      <span className="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="m12 5.2 1.9 4.2 4.6.5-3.4 3.1.9 4.5-4-2.3-4 2.3.9-4.5-3.4-3.1 4.6-.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="brand-name" dir="ltr">
        NINJA STAR
      </span>
    </>
  );
}
