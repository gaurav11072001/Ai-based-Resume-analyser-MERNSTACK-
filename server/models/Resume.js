const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
    select: true, // Ensure content is always selected
  },
  analysis: {
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    suggestions: [{
      category: {
        type: String,
        enum: ['format', 'content', 'keywords', 'grammar', 'other'],
      },
      text: String,
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
      },
    }],
    skills: [String],
    experience: [String],
    education: [String],
    matchedJobs: [{
      jobTitle: String,
      matchScore: Number,
      matchReason: String,
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', ResumeSchema);
