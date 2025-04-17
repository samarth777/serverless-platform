const express = require('express');
const router = express.Router();
const Function = require('../models/Function');

// Get all functions
router.get('/', async (req, res) => {
  try {
    const functions = await Function.find();
    res.status(200).json(functions);
  } catch (error) {
    console.error('Error fetching functions:', error);
    res.status(500).json({ message: 'Failed to fetch functions', error: error.message });
  }
});

// Get a specific function by ID
router.get('/:id', async (req, res) => {
  try {
    const func = await Function.findById(req.params.id);
    if (!func) {
      return res.status(404).json({ message: 'Function not found' });
    }
    res.status(200).json(func);
  } catch (error) {
    console.error('Error fetching function:', error);
    res.status(500).json({ message: 'Failed to fetch function', error: error.message });
  }
});

// Create a new function
router.post('/', async (req, res) => {
  try {
    const { name, description, runtime, code, handler, timeout, memorySize, environment } = req.body;
    
    // Validate required fields
    if (!name || !runtime || !code) {
      return res.status(400).json({ message: 'Name, runtime, and code are required fields' });
    }
    
    const newFunction = new Function({
      name,
      description,
      runtime,
      code,
      handler: handler || 'index.handler',
      timeout: timeout || 30,
      memorySize: memorySize || 128,
      environment: environment || {}
    });
    
    const savedFunction = await newFunction.save();
    res.status(201).json(savedFunction);
  } catch (error) {
    console.error('Error creating function:', error);
    res.status(500).json({ message: 'Failed to create function', error: error.message });
  }
});

// Update a function
router.put('/:id', async (req, res) => {
  try {
    const { name, description, runtime, code, handler, timeout, memorySize, environment } = req.body;
    
    const updatedFunction = await Function.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        runtime,
        code,
        handler,
        timeout,
        memorySize,
        environment,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedFunction) {
      return res.status(404).json({ message: 'Function not found' });
    }
    
    res.status(200).json(updatedFunction);
  } catch (error) {
    console.error('Error updating function:', error);
    res.status(500).json({ message: 'Failed to update function', error: error.message });
  }
});

// Delete a function
router.delete('/:id', async (req, res) => {
  try {
    const deletedFunction = await Function.findByIdAndDelete(req.params.id);
    
    if (!deletedFunction) {
      return res.status(404).json({ message: 'Function not found' });
    }
    
    res.status(200).json({ message: 'Function deleted successfully' });
  } catch (error) {
    console.error('Error deleting function:', error);
    res.status(500).json({ message: 'Failed to delete function', error: error.message });
  }
});

module.exports = router;