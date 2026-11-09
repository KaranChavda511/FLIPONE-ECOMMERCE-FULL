import { randomInt } from 'node:crypto';
import Seller from '../models/Seller.js';

const MAX_ATTEMPTS = 5;
const MIN_ID = 10000;
const MAX_ID = 99999;

export const generateUniqueLicenseID = async () => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const licenseID = String(randomInt(MIN_ID, MAX_ID + 1));
    if (!(await Seller.exists({ licenseID }))) return licenseID;
  }
  throw new Error(`Failed to generate unique licenseID after ${MAX_ATTEMPTS} attempts`);
};
