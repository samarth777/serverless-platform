const express = require('express');
const router = express.Router();
const Execution = require('../models/Execution');
const Function = require('../models/Function');
const executionEngine = require('../../execution-engine');
const { v4: uuidv4 } = require('uuid');

// Get all executions
router.get('/', async (req, res) => {
  try {
    const executions = await Execution.find().populate('functionId');
    res.status(200).json(executions);
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({ message: 'Failed to fetch executions', error: error.message });
  }
});

// Get executions for a specific function
router.get('/function/:functionId', async (req, res) => {
  try {
    const executions = await Execution.find({ functionId: req.params.functionId }).populate('functionId');
    res.status(200).json(executions);
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({ message: 'Failed to fetch executions', error: error.message });
  }
});

// Get a specific execution by ID
router.get('/:id', async (req, res) => {
  try {
    const execution = await Execution.findById(req.params.id).populate('functionId');
    
    if (!execution) {
      return res.status(404).json({ message: 'Execution not found' });
    }
    
    res.status(200).json(execution);
  } catch (error) {
    console.error('Error fetching execution:', error);
    res.status(500).json({ message: 'Failed to fetch execution', error: error.message });
  }
});

// Invoke a function (create a new execution)
router.post('/invoke/:functionId', async (req, res) => {
  try {
    // Find the function to execute
    const func = await Function.findById(req.params.functionId);
    
    if (!func) {
      return res.status(404).json({ message: 'Function not found' });
    }
    
    // Create a new execution record
    const execution = new Execution({
      functionId: func._id,
      status: 'pending',
      input: req.body,
      virtualizationTechnology: req.query.virtualization || 'docker'
    });
    
    await execution.save();
    
    // Execute the function asynchronously
    executeFunction(func, execution, req.body);
    
    // Return the execution record immediately
    res.status(202).json({
      message: 'Function execution initiated',
      executionId: execution._id,
      status: execution.status
    });
  } catch (error) {
    console.error('Error invoking function:', error);
    res.status(500).json({ message: 'Failed to invoke function', error: error.message });
  }
});

/**
 * Execute a function using the execution engine
 * @param {Object} func - Function data
 * @param {Object} execution - Execution record
 * @param {Object} input - Function input
 */
async function executeFunction(func, execution, input) {
  try {
    // Update to running status
    execution.status = 'running';
    await execution.save();
    
    // Execute the function
    const result = await executionEngine.executeFunction(
      func,
      input,
      {
        virtualizationTechnology: execution.virtualizationTechnology,
        timeout: func.timeout,
        memorySize: func.memorySize
      }
    );
    
    // Update execution record with results
    execution.status = result.status;
    execution.output = result.output;
    execution.endTime = result.endTime;
    execution.duration = result.duration;
    execution.memoryUsage = result.memoryUsage;
    execution.cpuUsage = result.cpuUsage;
    execution.logs = result.logs;
    execution.error = result.error;
    
    await execution.save();
  } catch (error) {
    console.error(`Error executing function ${func.name}:`, error);
    
    // Update execution record with error
    execution.status = 'failed';
    execution.error = error.message;
    execution.endTime = new Date();
    execution.logs = ['Function execution failed', error.message];
    
    await execution.save();
  }
}

module.exports = router;