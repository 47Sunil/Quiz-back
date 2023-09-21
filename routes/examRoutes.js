import express from "express";
import trimRequest from "trim-request";
import {
  answerQuestion,
  getUserReport,
} from "../controllers/examController.js";
import { isAuthenticated } from "../middlewares/isAuth.js";

const router = express.Router();

router.route("/").post(isAuthenticated, trimRequest.all, answerQuestion);
router.route("/report/:examId").get(isAuthenticated, getUserReport);

export default router;
