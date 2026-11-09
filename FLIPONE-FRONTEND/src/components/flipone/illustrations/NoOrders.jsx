import IllustrationFrame from "./IllustrationFrame";

/** A blank receipt with an empty, dashed tag-red stamp. For "no orders yet". */
export default function NoOrders(props) {
  return (
    <IllustrationFrame {...props}>
      <path d="M26 108h108" strokeDasharray="2 5" />
      <path
        d="M52 16h56v86l-7-5-7 5-7-5-7 5-7-5-7 5-7-5-7 5z"
        fill="#FFFFFF"
      />
      <path d="M62 30h24" />
      <path d="M62 40h36M62 48h28M62 56h32" strokeOpacity="0.4" />
      <path d="M62 86h14M90 86h8" strokeOpacity="0.4" />
      <rect
        x="64"
        y="62"
        width="48"
        height="17"
        rx="2"
        stroke="#D3261C"
        strokeDasharray="4 3"
        transform="rotate(-8 88 70.5)"
      />
    </IllustrationFrame>
  );
}
