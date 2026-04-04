const jwt = require ("jsonwebtoken");

function authMiddleware(req, res, next) {
  console.log("Headers:", req.headers);
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);
  if(!authHeader){
    return res.status(401).json({error: "Unauthorized"})
  }
  const token = authHeader.split(" ")[1] 


  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY, {
      algorithms: [process.env.JWT_ALGORITHM],
    });
    
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { authMiddleware };
