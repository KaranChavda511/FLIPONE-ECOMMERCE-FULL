import jwt from 'jsonwebtoken';

export const JWT_ALGORITHM = 'HS256';

// Was hard-coded to 365 days; now JWT_EXPIRE (default 1d), as the README always documented.
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
    algorithm: JWT_ALGORITHM,
  });

export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET, { algorithms: [JWT_ALGORITHM] });

export default generateToken;
