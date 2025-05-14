// src/utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id,role }, process.env.JWT_SECRET, {
    expiresIn: '365d'
  });
};

export default generateToken;
