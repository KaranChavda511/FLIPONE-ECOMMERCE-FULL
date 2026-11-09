// Demo data for FlipOne: categories, sellers, products (real sample photos), shoppers, admins,
// liked products and ~30 days of orders in every status. Safe to re-run: existing rows are kept
// (matched by email / name), and orders are only generated when the store has fewer than 10.
//
//   npm run seed:demo
//
// Demo logins (change them for anything public):
//   admins   admin@flipone.dev / FlipOne@Admin2026, ops@flipone.dev / FlipOne@Admin2026
//   sellers  <shop>@flipone.dev / FlipOne@Seller2026   (e.g. seller@flipone.dev = Acme Store)
//   shoppers <first>@flipone.dev / FlipOne@User2026    (e.g. riya@flipone.dev)
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';
import Seller from '../src/models/Seller.js';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
import Order, { SHIPPING_FEES } from '../src/models/Order.js';
import { generateUniqueLicenseID } from '../src/services/idGenerator.js';

const PHOTO_DIR = path.resolve(import.meta.dirname, '../../FLIPONE-FRONTEND/public');
const UPLOADS = path.resolve(import.meta.dirname, '../public/uploads');
const DAY = 24 * 60 * 60 * 1000;

// Deterministic PRNG so the demo data is the same on every machine.
let seed = 20261109;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const pick = (list) => list[Math.floor(rand() * list.length)];
const between = (min, max) => min + Math.floor(rand() * (max - min + 1));

const CATEGORIES = {
  Women: ['dresses', 'tops', 'ethnic wear', 'co-ord sets'],
  Men: ['shirts', 'jackets'],
  Footwear: ['sneakers', 'formal shoes', 'heels', 'flats'],
  Bags: ['handbags', 'totes', 'shoulder bags'],
  Watches: ['chronograph', 'automatic', 'dress watches'],
  Eyewear: ['sunglasses', 'frames'],
  Jewellery: ['necklaces', 'earrings', 'bracelets', 'hair accessories'],
};

const SELLERS = [
  { key: 'acme', name: 'Acme Store', email: 'seller@flipone.dev' },
  { key: 'kala', name: 'Kala Textiles', email: 'kala@flipone.dev' },
  { key: 'rang', name: 'Rang Boutique', email: 'rang@flipone.dev' },
  { key: 'sole', name: 'Urban Sole', email: 'urbansole@flipone.dev' },
  { key: 'mira', name: 'Mira Accessories', email: 'mira@flipone.dev' },
  { key: 'chronos', name: 'Chronos Watch Co.', email: 'chronos@flipone.dev' },
  { key: 'lumen', name: 'Lumen Eyewear', email: 'lumen@flipone.dev' },
  { key: 'tara', name: 'Tara Jewels', email: 'tara@flipone.dev' },
  // Deactivated by the admin: its products stay hidden from the storefront.
  { key: 'mill', name: 'Old Mill Denim', email: 'oldmill@flipone.dev', isActive: false },
];

// [seller, name, category, subcategory, price, stock, photos[], description]
const PRODUCTS = [
  ['acme', 'Classic Oxford Shirt', 'Men', 'shirts', 1299, 10, ['shirt-image4.jpeg'], 'Light-blue cotton oxford with a button-down collar and chest pocket. Regular fit.'],
  ['acme', 'Running Shoes', 'Footwear', 'sneakers', 2499, 5, ['shoes-image1.jpeg'], 'Chunky white running sneakers with a cushioned sole and breathable mesh panels.'],
  ['acme', 'Teal Ombré Linen Shirt', 'Men', 'shirts', 1499, 14, ['shirt-image1.jpeg'], 'Linen-blend shirt dip-dyed from teal to white. Relaxed fit, full sleeves.'],
  ['acme', 'Pink Check Overshirt', 'Men', 'shirts', 1399, 3, ['shirt-image2.jpeg'], 'Soft brushed-cotton check overshirt to wear open over a tee.'],
  ['acme', 'Blue Stripe Cotton Shirt', 'Men', 'shirts', 1199, 22, ['shirt-image5.jpeg'], 'Crisp vertical-stripe cotton shirt for office or weekend.'],
  ['acme', 'Sky Ombré Shirt', 'Men', 'shirts', 1449, 0, ['shirt-image6.jpeg'], 'Sky-blue to white ombré shirt in breathable cotton.'],
  ['acme', 'Stone Twill Overshirt', 'Men', 'jackets', 2299, 8, ['men-image.jpeg'], 'Stone-coloured twill overshirt jacket with flap pockets.'],
  ['acme', 'Court Classic Sneakers', 'Footwear', 'sneakers', 2799, 11, ['shoes-image2.jpeg'], 'Low-top leather court sneakers with a green heel tab.'],
  ['acme', 'Trail Runner Sneakers', 'Footwear', 'sneakers', 2999, 6, ['shoes-image5.jpeg'], 'Black and white chunky trail runners with a grippy sole.'],

  ['kala', 'Red Floral Anarkali Top', 'Women', 'ethnic wear', 1299, 12, ['sec2-image1.jpeg'], 'Flared cotton kurti top in a red floral print with V-neck.'],
  ['kala', 'Sage Floral Peplum Top', 'Women', 'tops', 999, 18, ['sec2-image2.jpeg'], 'Hand-block printed peplum top in sage and red.'],
  ['kala', 'Block-Print Tiered Top', 'Women', 'tops', 899, 9, ['sec2-image3.jpeg', 'sec2-image7.jpeg'], 'Tiered cotton top with a green hand-block print.'],
  ['kala', 'Red Floral Ruffle Blouse', 'Women', 'tops', 1099, 2, ['sec2-image4.jpeg'], 'Flowy V-neck blouse with ruffled cuffs.'],
  ['kala', 'Teal Kalamkari Top', 'Women', 'ethnic wear', 1199, 7, ['sec2-image5.jpeg'], 'Kalamkari-print cotton top in teal and rust.'],
  ['kala', 'Indigo Floral Short Kurti', 'Women', 'ethnic wear', 949, 15, ['sec2-image6.jpeg'], 'Short kurti in indigo floral print with three-quarter sleeves.'],
  ['kala', 'Mustard Paisley Tunic', 'Women', 'ethnic wear', 1049, 10, ['sec2-image8.jpeg'], 'Mustard paisley tunic with a gathered yoke.'],
  ['kala', 'Blush Pink Lehenga Set', 'Women', 'ethnic wear', 7999, 3, ['dress-image2.jpeg'], 'Flared blush lehenga with a matching crop blouse.'],
  ['kala', 'Rose Embroidered Sharara Set', 'Women', 'ethnic wear', 5499, 4, ['dress-image4.jpeg'], 'Embroidered jacket with sharara pants in dusty rose.'],

  ['acme', 'Floral Summer Dress', 'Women', 'dresses', 1799, 2, ['dress-image8.jpeg'], 'Tiered tropical-print maxi with flutter sleeves.'],
  ['rang', 'Navy Wrap Maxi Dress', 'Women', 'dresses', 2299, 6, ['dress-image1.jpeg'], 'Floor-length navy wrap dress with short sleeves.'],
  ['rang', 'Ivory Floral Puff-Sleeve Midi', 'Women', 'dresses', 2099, 9, ['dress-image10.jpeg'], 'Ivory midi with a ditsy floral print and puff sleeves.'],
  ['rang', 'Champagne Satin Slip Gown', 'Women', 'dresses', 3499, 5, ['dress-image12.jpeg'], 'Bias-cut champagne satin gown with a cowl neck.'],
  ['rang', 'Periwinkle Tulle Gown', 'Women', 'dresses', 3999, 2, ['dress-image3.jpeg'], 'Layered tulle gown in periwinkle with a sweetheart neckline.'],
  ['rang', 'Crimson Sweetheart Midi', 'Women', 'dresses', 1899, 12, ['dress-image5.jpeg'], 'Crimson midi with a sweetheart neckline and three-quarter sleeves.'],
  ['rang', 'White Button-Front Maxi', 'Women', 'dresses', 1999, 8, ['dress-image6.jpeg'], 'White button-front maxi with short sleeves and a tie waist.'],
  ['rang', 'Black Tulle Party Dress', 'Women', 'dresses', 2599, 0, ['dress-image7.jpeg'], 'Black midi with sheer tulle sleeves and a full skirt.'],
  ['rang', 'Rust Top & Linen Skirt Set', 'Women', 'co-ord sets', 2199, 7, ['dress-image9.jpeg'], 'Rust tee with a buttoned linen midi skirt.'],
  ['rang', 'Mocha Ribbed Turtleneck', 'Women', 'tops', 1149, 20, ['woman-image.jpeg'], 'Fitted ribbed turtleneck in mocha brown.'],

  ['sole', 'Sage Pointed Slingback Flats', 'Footwear', 'flats', 1599, 9, ['footware-image1.jpeg'], 'Pointed-toe slingback flats in sage faux leather.'],
  ['sole', 'White Slingback Pumps', 'Footwear', 'heels', 1899, 6, ['footware-image2.jpeg'], 'Low-heel white slingback pumps for work and weddings.'],
  ['sole', 'Nude Strappy Stilettos', 'Footwear', 'heels', 2199, 3, ['footware-image3.jpeg'], 'Barely-there strappy stilettos in nude.'],
  ['sole', 'Beige Block-Heel Sandals', 'Footwear', 'heels', 1699, 12, ['footware-image4.jpeg'], 'Ankle-strap sandals on a comfortable block heel.'],
  ['sole', 'White Crystal Strap Block Heels', 'Footwear', 'heels', 1999, 5, ['footware-image5.jpeg'], 'Square-toe block heels with a crystal strap.'],
  ['sole', 'Sand Suede Derby Shoes', 'Footwear', 'formal shoes', 2899, 7, ['shoes-image3.jpeg'], 'Sand suede lace-up derbies with a crepe-look sole.'],
  ['sole', 'Grey Suede Derby Shoes', 'Footwear', 'formal shoes', 2899, 1, ['shoes-image4.jpeg'], 'Grey suede lace-up derbies.'],

  ['mira', 'Ruched-handle Flap Bag', 'Bags', 'shoulder bags', 1599, 10, ['bag-image1.jpeg'], 'Structured flap bag with a ruched scrunchie handle.'],
  ['mira', 'Cream Crescent Shoulder Bag', 'Bags', 'shoulder bags', 1799, 8, ['bag-image2.jpeg'], 'Minimal crescent shoulder bag in cream.'],
  ['mira', 'Handmade Crochet Mini Bag', 'Bags', 'handbags', 1299, 4, ['bag-image3.jpeg'], 'Hand-crocheted chunky mini bag with a gold clasp.'],
  ['mira', 'White Tassel Tote', 'Bags', 'totes', 2199, 6, ['bag-image4.jpeg'], 'Roomy white tote with a tassel charm.'],
  ['mira', 'Pearl Hair Clips (Set of 2)', 'Jewellery', 'hair accessories', 399, 30, ['jwellary-image6.jpeg'], 'Gold-tone snap clips covered in faux pearls.'],
  ['mira', 'Butterfly Hair Pins', 'Jewellery', 'hair accessories', 349, 25, ['jwellary-image8.jpeg'], 'Set of four butterfly bobby pins.'],
  ['mira', 'Pastel Snap Clips (Pack of 10)', 'Jewellery', 'hair accessories', 299, 40, ['jwellary-image9.jpeg'], 'Matte pastel snap clips.'],

  ['chronos', 'Rose Gold Link Watch', 'Watches', 'dress watches', 4999, 5, ['jwellary-image2.jpeg'], 'Black dial on a rose-gold link bracelet.'],
  ['chronos', 'Green Dial Chronograph', 'Watches', 'chronograph', 8999, 3, ['watch-image2.jpeg'], 'Green sunray dial chronograph on a brown leather strap.'],
  ['chronos', 'Classic Leather Chronograph', 'Watches', 'chronograph', 6499, 6, ['watch-image4.jpeg'], 'Rose-gold case chronograph with a tan leather strap.'],
  ['chronos', 'Skeleton Automatic Mesh Watch', 'Watches', 'automatic', 7499, 2, ['watch-image7.jpeg'], 'Open-heart automatic movement on a black mesh strap.'],

  ['lumen', 'Rose-Tint Round Sunglasses', 'Eyewear', 'sunglasses', 899, 14, ['glasses-image1.jpeg'], 'Thin gold round frames with rose-tinted lenses.'],
  ['lumen', 'Oversized Square Sunglasses', 'Eyewear', 'sunglasses', 1199, 9, ['glasses-image2.jpeg'], 'Oversized square frames with gradient lenses.'],
  ['lumen', 'Browline Cat-Eye Frames', 'Eyewear', 'frames', 1499, 7, ['glasses-image3.jpeg'], 'Clear cat-eye frames with a black browline. Fits prescription lenses.'],
  ['lumen', 'Round Retro Sunglasses', 'Eyewear', 'sunglasses', 799, 20, ['glasses-image4.jpeg'], 'Round metal frames in five lens colours.'],
  ['lumen', 'Hexagon Gradient Sunglasses', 'Eyewear', 'sunglasses', 999, 4, ['glasses-image5.jpeg'], 'Clear hexagon frames with violet gradient lenses.'],
  ['lumen', 'Gold Hexagon Green-Lens Sunglasses', 'Eyewear', 'sunglasses', 1299, 10, ['glasses-image6.jpeg'], 'Gold hexagon frames with classic green lenses.'],

  ['tara', 'Crystal Tennis Necklace Set', 'Jewellery', 'necklaces', 2499, 5, ['jwellary-image1.jpeg'], 'Crystal tennis necklace with matching stud earrings.'],
  ['tara', 'Gold Clover Bracelet Stack', 'Jewellery', 'bracelets', 1299, 8, ['jwellary-image3.jpeg'], 'Three gold-plated bracelets including a clover charm.'],
  ['tara', 'Gold Lariat Necklace Set', 'Jewellery', 'necklaces', 1499, 6, ['jwellary-image4.jpeg'], 'Gold-plated lariat necklace with drop earrings.'],
  ['tara', 'Layered Butterfly Necklace', 'Jewellery', 'necklaces', 999, 12, ['jwellary-image5.jpeg'], 'Three-layer gold chain with butterfly and initial charms.'],
  ['tara', 'Crystal Bow Earrings', 'Jewellery', 'earrings', 699, 2, ['jwellary-image7.jpeg'], 'Delicate crystal bow drop earrings.'],

  ['mill', 'Washed Denim Shirt', 'Men', 'shirts', 1699, 10, ['shirt-image3.jpeg'], 'Mid-wash denim shirt with two flap pockets.'],
];

const SHOPPERS = [
  ['Riya Shah', 'riya', '9876543210', 'Pune', 'Maharashtra', '411001'],
  ['Aarav Mehta', 'aarav', '9820011223', 'Mumbai', 'Maharashtra', '400050'],
  ['Priya Nair', 'priya', '9847022334', 'Kochi', 'Kerala', '682016'],
  ['Kabir Singh', 'kabir', '9811033445', 'New Delhi', 'Delhi', '110017'],
  ['Ananya Iyer', 'ananya', '9840044556', 'Chennai', 'Tamil Nadu', '600020'],
  ['Rohan Gupta', 'rohan', '9829055667', 'Jaipur', 'Rajasthan', '302001'],
  ['Sneha Kulkarni', 'sneha', '9890066778', 'Pune', 'Maharashtra', '411038'],
  ['Arjun Reddy', 'arjun', '9849077889', 'Hyderabad', 'Telangana', '500034'],
  ['Meera Joshi', 'meera', '9825088990', 'Ahmedabad', 'Gujarat', '380015'],
  ['Ishaan Bose', 'ishaan', '9831099001', 'Kolkata', 'West Bengal', '700019'],
  // Deactivated by the admin.
  ['Vikram Das', 'vikram', '9830010112', 'Kolkata', 'West Bengal', '700029', false],
];
const STREETS = ['12 MG Road', '4B Linking Road', '27 Marine Drive', '9 Hauz Khas Village', '18 TTK Road', '55 MI Road', '3 FC Road', '41 Road No. 12', '7 CG Road', '22 Gariahat Road', '15 Park Street'];

const log = (...a) => console.log(...a);

const copyPhoto = (file) => {
  const target = `seed-${file.replace(/\.(jpe?g)$/i, '')}.jpg`;
  const dest = path.join(UPLOADS, target);
  if (!fs.existsSync(dest)) fs.copyFileSync(path.join(PHOTO_DIR, file), dest);
  return `/uploads/${target}`;
};

async function upsertCategories(admin) {
  const byName = {};
  for (const [name, subs] of Object.entries(CATEGORIES)) {
    byName[name] = await Category.findOneAndUpdate(
      { name },
      { $set: { subcategories: subs }, $setOnInsert: { createdBy: admin._id } },
      { upsert: true, returnDocument: 'after' },
    );
  }
  log(`categories: ${Object.keys(byName).join(', ')}`);
  return byName;
}

async function upsertAccount(Model, filter, data) {
  const existing = await Model.findOne(filter);
  if (existing) return existing;
  return Model.create(data);
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set (put it in .env)');
  fs.mkdirSync(UPLOADS, { recursive: true });
  await mongoose.connect(process.env.MONGO_URI);
  log(`connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  const admin = await upsertAccount(Admin, { email: 'admin@flipone.dev' }, { name: 'FlipOne Admin', email: 'admin@flipone.dev', password: 'FlipOne@Admin2026' });
  await upsertAccount(Admin, { email: 'ops@flipone.dev' }, { name: 'Neha Verma', email: 'ops@flipone.dev', password: 'FlipOne@Admin2026' });

  const categories = await upsertCategories(admin);

  const sellers = {};
  for (const s of SELLERS) {
    sellers[s.key] = await upsertAccount(Seller, { email: s.email }, {
      name: s.name, email: s.email, password: 'FlipOne@Seller2026', licenseID: await generateUniqueLicenseID(),
    });
    if (s.isActive === false && sellers[s.key].isActive) {
      sellers[s.key].isActive = false;
      await sellers[s.key].save();
    }
  }
  // Shops joined over the last ~3 months (Acme first), so sign-up charts look like a real marketplace.
  for (const [i, s] of SELLERS.entries()) {
    await Seller.collection.updateOne({ _id: sellers[s.key]._id }, { $set: { createdAt: new Date(Date.now() - (90 - i * 9) * DAY) } });
  }
  log(`sellers: ${Object.keys(sellers).length}`);

  const products = [];
  for (const [sellerKey, name, categoryName, sub, price, stock, photos, description] of PRODUCTS) {
    const seller = sellers[sellerKey];
    const category = categories[categoryName];
    const images = photos.map(copyPhoto);
    const doc = await Product.findOneAndUpdate(
      { seller: seller._id, name },
      {
        $set: { category: { _id: category._id, name: category.name }, subcategories: [sub], images, description, price, isActive: seller.isActive !== false },
        $setOnInsert: { seller: seller._id, name, stock },
      },
      { upsert: true, returnDocument: 'after', runValidators: false },
    );
    products.push(doc);
  }
  // Spread createdAt over the last 45 days so "Newest first" means something.
  for (const [i, p] of products.entries()) {
    await Product.collection.updateOne({ _id: p._id }, { $set: { createdAt: new Date(Date.now() - (45 - i * 0.7) * DAY) } });
  }
  log(`products: ${products.length}`);

  const shoppers = [];
  for (const [i, [name, handle, mobile, city, state, pin, active]] of SHOPPERS.entries()) {
    const email = `${handle}@flipone.dev`;
    const user = await upsertAccount(User, { email }, {
      name, email, password: 'FlipOne@User2026', mobile, address: `${STREETS[i]}, ${city}, ${state} ${pin}`,
    });
    if (active === false && user.isActive) {
      user.isActive = false;
      await user.save();
    }
    await User.collection.updateOne({ _id: user._id }, { $set: { createdAt: new Date(Date.now() - (60 - i * 5) * DAY) } });
    shoppers.push({ user, city, state, pin, street: STREETS[i] });
  }
  log(`shoppers: ${shoppers.length}`);

  const buyable = products.filter((p) => p.isActive);
  for (const { user } of shoppers) {
    const liked = new Set();
    for (let n = between(2, 6); n > 0; n--) liked.add(String(pick(buyable)._id));
    await User.updateOne({ _id: user._id }, { $addToSet: { likedProducts: { $each: [...liked] } } });
  }

  const existingOrders = await Order.countDocuments();
  if (existingOrders >= 10) {
    log(`orders: ${existingOrders} already exist, not generating more`);
  } else {
    let created = 0;
    const activeShoppers = shoppers.filter((s) => s.user.isActive !== false);
    for (let i = 0; i < 34; i++) {
      const daysAgo = Math.max(0, 29 - i + between(-1, 1)) + rand();
      const { user, street, city, state, pin } = pick(activeShoppers);
      const lines = [];
      for (let n = between(1, 3); n > 0; n--) {
        const product = pick(buyable);
        if (lines.some((l) => l.productId.equals(product._id))) continue;
        lines.push({
          productId: product._id, seller: product.seller, name: product.name, price: product.price,
          quantity: rand() < 0.8 ? 1 : 2, image: product.images,
        });
      }

      const cancelled = rand() < 0.1;
      const itemStatus = () => {
        if (cancelled) return 'cancelled';
        if (daysAgo > 10) return 'delivered';
        if (daysAgo > 4) return rand() < 0.6 ? 'delivered' : 'shipped';
        if (daysAgo > 1.5) return rand() < 0.5 ? 'shipped' : 'pending';
        return 'pending';
      };

      // Take stock like a real checkout (skip lines that would oversell); cancelled orders gave it back.
      const kept = [];
      for (const line of lines) {
        if (cancelled) { kept.push(line); continue; }
        const ok = await Product.findOneAndUpdate(
          { _id: line.productId, stock: { $gte: line.quantity } },
          { $inc: { stock: -line.quantity } },
        );
        if (ok) kept.push(line);
      }
      if (!kept.length) continue;

      const items = kept.map((line) => ({ ...line, status: itemStatus() }));
      const live = items.map((it) => it.status).filter((s) => s !== 'cancelled');
      const status = !live.length ? 'cancelled'
        : live.every((s) => s === 'delivered') ? 'delivered'
          : live.every((s) => s !== 'pending') ? 'shipped' : 'pending';
      const shippingMethod = rand() < 0.75 ? 'flat' : 'pickup';
      const shippingFee = SHIPPING_FEES[shippingMethod];
      const createdAt = new Date(Date.now() - daysAgo * DAY);

      const order = await Order.create({
        user: user._id,
        items: items.map((it) => ({ ...it, createdAt })),
        totalAmount: items.reduce((sum, it) => sum + it.price * it.quantity, 0) + shippingFee,
        shippingAddress: { street, city, state, postalCode: pin },
        shippingMethod,
        shippingFee,
        status,
      });
      await Order.collection.updateOne({ _id: order._id }, { $set: { createdAt, updatedAt: createdAt } });
      created++;
    }
    log(`orders: created ${created}`);
  }

  // Report uploads that no product or user references any more (left by earlier edits).
  const referenced = new Set();
  for (const p of await Product.find().select('images').lean()) p.images.forEach((img) => referenced.add(path.basename(img)));
  for (const u of await User.find({ profilePic: { $exists: true } }).select('profilePic').lean()) referenced.add(path.basename(u.profilePic));
  const orphans = fs.readdirSync(UPLOADS).filter((f) => !referenced.has(f) && !f.startsWith('.'));
  log(`unreferenced uploads (${orphans.length}): ${orphans.join(' ')}`);

  await mongoose.disconnect();
  log('done');
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
