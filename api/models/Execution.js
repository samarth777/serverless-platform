const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  functionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Function',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number
  },
  input: {
    type: Object,
    default: {}
  },
  output: {
    type: Object
  },
  error: {
    type: String
  },
  logs: {
    type: [String],
    default: []
  },
  memoryUsage: {
    type: Number
  },
  cpuUsage: {
    type: Number
  },
  virtualizationTechnology: {
    type: String,
    enum: ['docker', 'firecracker', 'gvisor', 'nanos'],
    default: 'docker'
  }
});

module.exports = mongoose.model('Execution', executionSchema);