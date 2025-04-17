/**
 * Sample AWS Lambda-style JavaScript function
 * 
 * This function takes an input with a name and returns a greeting
 * @param {Object} event - Input event from the caller
 * @param {Object} context - Execution context
 * @param {Function} callback - Callback function to return results
 * @returns {Object} - Response object with greeting
 */
exports.handler = (event, context, callback) => {
  console.log('Function execution started');
  console.log('Input event:', JSON.stringify(event));
  
  try {
    const name = event.name || 'World';
    const response = {
      statusCode: 200,
      body: {
        message: `Hello, ${name}!`,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('Function execution completed successfully');
    
    // Return the response either via callback or direct return (supports both)
    if (callback) {
      callback(null, response);
    }
    return response;
  } catch (error) {
    console.error('Function execution failed:', error);
    
    const errorResponse = {
      statusCode: 500,
      body: {
        message: 'Error processing request',
        error: error.message
      }
    };
    
    if (callback) {
      callback(error);
    }
    throw error;
  }
};