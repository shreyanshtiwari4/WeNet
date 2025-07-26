import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
  rule: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Rule", ruleSchema);