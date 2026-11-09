import IllustrationFrame from "./IllustrationFrame";

/** Empty shopping bag with a blank kraft swing tag on a string. For an empty cart / saved list. */
export default function EmptyBag(props) {
  return (
    <IllustrationFrame {...props}>
      <path d="M26 104h108" strokeDasharray="2 5" />
      <path d="M48 44h64l6 58H42z" fill="#FFFFFF" />
      <path d="M48 52h64" strokeOpacity="0.35" />
      <path d="M64 44v-8a16 16 0 0 1 32 0v8" />
      <circle cx="64" cy="50" r="1.6" fill="#17150F" stroke="none" />
      <circle cx="96" cy="50" r="1.6" fill="#17150F" stroke="none" />
      <path d="M96 38c12 2 23 10 27 23" strokeWidth="1.25" />
      <g transform="translate(124 66) rotate(-12)">
        <path d="M-8-4 0-12 8-4v26H-8z" fill="#CDAE80" />
        <circle cy="-5" r="2" fill="#F5F4F0" />
        <path d="M-4 6h8M-4 11h5" strokeWidth="1.25" strokeOpacity="0.55" />
      </g>
    </IllustrationFrame>
  );
}
