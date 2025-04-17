const mongoose = require('mongoose');

const functionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  runtime: {
    type: String,
    required: true,
    enum: ['python', 'javascript'],
    default: 'javascript'
  },
  code: {
    type: String,
    required: true
  },
  handler: {
    type: String,
    required: true,
    default: 'index.handler'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  timeout: {
    type: Number,
    default: 30,
    min: 1,
    max: 300
  },
  memorySize: {
    type: Number,
    default: 128,
    min: 64,
    max: 1024
  },
  environment: {
    type: Map,
    of: String,
    default: new Map()
  }
});

module.exports = mongoose.model('Function', functionSchema);