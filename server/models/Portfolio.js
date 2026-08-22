import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main_portfolio' },
    personalInfo: { type: Object, default: {} },
    roles: { type: Object, default: {} },
    projects: { type: Array, default: [] },
    skills: { type: Object, default: {} },
    certifications: { type: Array, default: [] },
    experience: { type: Array, default: [] },
    activeCourses: { type: Array, default: [] }
  },
  { timestamps: true }
);

export default mongoose.model('Portfolio', portfolioSchema);
