import questionModel from "../models/questionModel.js";
import examModel from "../models/examModel.js";
import userModel from "../models/userModel.js";
import { isValid, isValidObjectId } from "../utils/regex.js";

// create Questions

export const createQuestions = async (req, res) => {
  try {
    const { question, options, answer } = req.body;
    const createdQuestion = await questionModel.create(req.body);
    return res.status(201).json({
      success: true,
      message: "A new Question has been Created",
      data: createdQuestion,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: error.message });
  }
};

// Get 5 rendom questions array

export const getQuestions = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const count = 5;

    if (!isValidObjectId(roomId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid roomId" });
    }

    // Check if roomId already exists in any exam object
    const existingExam = await examModel.findOne({ roomId });

    if (existingExam) {
      return res.status(400).json({
        success: false,
        message: "Exam with the same roomId already exists",
      });
    }

    // Get 5 random questions
    const randomQuestions = await questionModel.aggregate([
      { $sample: { size: count } },
    ]);

    // Create a new exam document with the roomId and random question objects
    const exam = new examModel({
      roomId: roomId,
      questions: randomQuestions,
    });

    // Save the exam document to the Exam collection
    await exam.save();

    return res.status(201).json({
      success: true,
      message: "A new Exam has been created",
      data: exam,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// get single question

export const getSingleQuestion = async (req, res) => {
  try {
    const examId = req.query.examId;
    const questionIndex = parseInt(req.query.questionIndex);

    if (!isValidObjectId(examId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid examId" });
    }

    const exam = await examModel.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (questionIndex < 0 || questionIndex >= exam.questions.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index",
      });
    }

    const question = exam.questions[questionIndex];

    const responseQuestion = {
      _id: question._id,
      question: question.question,
      options: question.options,
    };

    return res.status(200).json({
      success: true,
      data: responseQuestion,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
