import examModel from "../models/examModel.js";
import roomModel from "../models/roomModel.js";
import userModel from "../models/userModel.js";

// create Room

export const createRoom = async (req, res) => {
  try {
    const userId = req.user;
    const { roomName } = req.body;

    const findRoom = await roomModel.findOne({ roomName });
    if (findRoom) {
      return res
        .status(400)
        .json({ success: false, message: "Room name already exists" });
    }

    // Create a new room document
    const newRoom = new roomModel({ roomName });
    newRoom.user.push(userId);
    const createdRoom = await newRoom.save();

    // Update the user's joinedRoom field
    await userModel.findByIdAndUpdate(
      userId,
      { $set: { joinedRoom: createdRoom._id } },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "A new room has been created",
      data: createdRoom,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// get rooms

export const lobby = async (req, res) => {
  try {
    const roomsWithOnePlayer = await roomModel.find({
      user: { $size: 1 },
    });

    if (!roomsWithOnePlayer || roomsWithOnePlayer.length === 0) {
      return res.status(404).json({
        success: false,
        message: "All rooms are booked. Create a new room player.",
      });
    }

    return res.status(200).json({
      success: true,
      totalRooms: roomsWithOnePlayer.length,
      data: roomsWithOnePlayer,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Join room

export const joinRoom = async (req, res) => {
  try {
    const userId = req.user;
    const roomId = req.params.roomId;

    console.log(userId, roomId);

    const findRoom = await roomModel.findById(roomId);
    if (!findRoom) {
      return res
        .status(404)
        .json({ success: false, message: " Room not found" });
    }

    if (findRoom.user.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already in this room",
      });
    }

    if (findRoom.user.length >= 2) {
      return res
        .status(400)
        .json({ success: false, message: "Only two players are allowed" });
    }

    const usersInRoom = await roomModel.findById(userId);
    if (usersInRoom) {
      return res.status(400).json({
        success: false,
        message: "You can only join one room at once",
      });
    }

    findRoom.user.push(userId);
    await findRoom.save();
    return res.status(200).json({
      success: true,
      message: "Welcome",
      data: findRoom,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: error.message });
  }
};

// Delete room

export const exitRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const findRoom = await roomModel.findByIdAndDelete(roomId);
    if (!findRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const findExam = await examModel.findOneAndDelete({ roomId });

    return res.status(200).json({
      success: true,
      message: "Room Deleted Successfuly",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
