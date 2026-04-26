export default function RoadPath() {
  return (
    <svg
      className="road-path"
      viewBox="0 0 360 360"
      role="img"
      aria-label="弯弯的小路"
      preserveAspectRatio="none"
    >
      <path
        className="road-path-shadow"
        d="M 40 310 C 95 246 174 302 210 218 C 242 142 126 126 160 72 C 184 34 266 42 316 78"
      />
      <path
        className="road-path-main"
        d="M 40 310 C 95 246 174 302 210 218 C 242 142 126 126 160 72 C 184 34 266 42 316 78"
      />
      <path
        className="road-path-dash"
        d="M 40 310 C 95 246 174 302 210 218 C 242 142 126 126 160 72 C 184 34 266 42 316 78"
      />
    </svg>
  );
}
