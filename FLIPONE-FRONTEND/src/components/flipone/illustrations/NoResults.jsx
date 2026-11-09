import IllustrationFrame from "./IllustrationFrame";

/** A kraft price tag under a magnifier that finds nothing. For "no search results" / empty filters. */
export default function NoResults(props) {
  return (
    <IllustrationFrame {...props}>
      <path d="M26 106h108" strokeDasharray="2 5" />
      <path d="M34 34h42l15 15-15 15H34z" fill="#CDAE80" />
      <circle cx="78" cy="49" r="3" fill="#F5F4F0" />
      <path d="M42 44h18M42 54h12" strokeWidth="1.25" strokeOpacity="0.55" />
      <circle cx="98" cy="68" r="20" fill="#FFFFFF" />
      <path d="M112.5 82.5 127 97" strokeWidth="5" />
      <path d="M91.5 61.5l13 13M104.5 61.5l-13 13" />
    </IllustrationFrame>
  );
}
