/* Sample photos in public/ for the usual category names (any other name gets a label-only tile). */
export const CATEGORY_IMAGES = {
  women: { src: "/woman-image.jpeg", position: "50% 22%" },
  woman: { src: "/woman-image.jpeg", position: "50% 22%" },
  men: { src: "/men-image.jpeg", position: "50% 30%" },
  man: { src: "/men-image.jpeg", position: "50% 30%" },
  bags: { src: "/bag-image1.jpeg", position: "50% 60%" },
  bag: { src: "/bag-image1.jpeg", position: "50% 60%" },
  footwear: { src: "/footware-image2.jpeg", position: "50% 55%" },
  shoes: { src: "/shoes-image1.jpeg", position: "50% 55%" },
  watches: { src: "/watch-image2.jpeg", position: "50% 50%" },
  watch: { src: "/watch-image2.jpeg", position: "50% 50%" },
  eyewear: { src: "/glasses-image1.jpeg", position: "50% 45%" },
  glasses: { src: "/glasses-image1.jpeg", position: "50% 45%" },
  jewellery: { src: "/jwellary-image1.jpeg", position: "50% 60%" },
  jewelry: { src: "/jwellary-image1.jpeg", position: "50% 60%" },
  dresses: { src: "/dress-image1.jpeg", position: "50% 30%" },
  shirts: { src: "/shirt-image1.jpeg", position: "50% 35%" },
};

/** The two departments that open the shop side by side, at equal size: neither leads. */
export const LEAD_CATEGORIES = ["men", "women"];

const stem = (path) =>
  String(path ?? "")
    .split("/")
    .pop()
    .replace(/^seed-/, "")
    .replace(/\.[a-z0-9]+$/i, "");

const LEAD_PHOTO_STEMS = new Set(LEAD_CATEGORIES.map((name) => stem(CATEGORY_IMAGES[name].src)));

/** True when a product photo is one of the band's lead photos (seeded products reuse them as seed-<name>.jpg). */
export const usesBandPhoto = (imagePath) => LEAD_PHOTO_STEMS.has(stem(imagePath));
