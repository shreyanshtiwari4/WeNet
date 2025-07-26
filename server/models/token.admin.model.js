import mongoose from "mongoose";

const adminTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
});

export default mongoose.model("AdminToken", adminTokenSchema);