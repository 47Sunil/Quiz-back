import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const { HASHTOKEN } = process.env;

export const isAuthenticated = async (req, res, next) => {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.status(400).send({ status: false, msg: "Token not present" });
    }
    let decodedToken = jwt.verify(token, HASHTOKEN, (error, response) => {
      if (error) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid tokens" });
      }
      req.user = response;
      next();
    });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};
