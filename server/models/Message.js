import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: 'Portfolio Inquiry' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
