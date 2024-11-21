const jwt = require("jsonwebtoken");

class JwtUtil {
  static generateToken(payload, secretKey, expiresIn = "1h") {
    return jwt.sign(payload, secretKey, { expiresIn });
  }

  static verifyToken(token, secretKey) {
    return jwt.verify(token, secretKey);
  }

  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JwtUtil;
