const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return secret;
};

module.exports = getJwtSecret;
module.exports.getJwtSecret = getJwtSecret;
