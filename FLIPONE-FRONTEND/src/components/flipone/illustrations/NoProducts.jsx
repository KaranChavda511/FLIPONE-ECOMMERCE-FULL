import IllustrationFrame from "./IllustrationFrame";

/** An open, empty shipping box with one blank kraft tag. For a seller with no products / an empty catalog. */
export default function NoProducts(props) {
  return (
    <IllustrationFrame {...props}>
      <path d="M26 104h108" strokeDasharray="2 5" />
      <g transform="translate(80 40) rotate(8)">
        <path d="M-8-4 0-12 8-4v26H-8z" fill="#CDAE80" />
        <circle cy="-5" r="2" fill="#F5F4F0" />
        <path d="M-4 6h8" strokeWidth="1.25" strokeOpacity="0.55" />
      </g>
      <path d="M42 58 30 42h34l16 16" fill="#FFFFFF" />
      <path d="M118 58l12-16H96L80 58" fill="#FFFFFF" />
      <path d="M42 58h76v44H42z" fill="#FFFFFF" />
      <path d="M80 58v15" />
      <path d="M52 92h14" strokeOpacity="0.4" />
    </IllustrationFrame>
  );
}
