import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

const CreateFunction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [envVars, setEnvVars] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    runtime: 'javascript',
    code: '',
    handler: 'index.handler',
    timeout: 30,
    memorySize: 128,
    environment: {}
  });
  
  // Update handler when runtime changes
  const handleRuntimeChange = (e) => {
    const runtime = e.target.value;
    // Set appropriate default handler based on runtime
    let defaultHandler = runtime === 'javascript' ? 'index.handler' : 'main.handler';
    
    setFormData({
      ...formData,
      runtime,
      handler: defaultHandler
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEnvVarChange = (index, field, value) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
    
    // Update environment object in formData
    const environment = {};
    newEnvVars.forEach(env => {
      if (env.key && env.value) {
        environment[env.key] = env.value;
      }
    });
    
    setFormData({
      ...formData,
      environment
    });
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index) => {
    const newEnvVars = [...envVars];
    newEnvVars.splice(index, 1);
    setEnvVars(newEnvVars);
    
    // Update environment object in formData
    const environment = {};
    newEnvVars.forEach(env => {
      if (env.key && env.value) {
        environment[env.key] = env.value;
      }
    });
    
    setFormData({
      ...formData,
      environment
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.name) {
        throw new Error('Function name is required');
      }
      
      if (!formData.code) {
        throw new Error('Function code is required');
      }
      
      // Create the function
      const response = await ApiService.createFunction(formData);
      
      // Redirect to the function detail page
      navigate(`/functions/${response.data._id}`);
    } catch (error) {
      console.error('Error creating function:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create function');
      setLoading(false);
    }
  };

  const getCodeTemplate = () => {
    if (formData.runtime === 'javascript') {
      return `/**
 * Sample AWS Lambda-style JavaScript function
 * 
 * @param {Object} event - Input event from the caller
 * @param {Object} context - Execution context
 * @param {Function} callback - Callback function to return results
 * @returns {Object} - Response object
 */
exports.handler = (event, context, callback) => {
  console.log('Function execution started');
  console.log('Input event:', JSON.stringify(event));
  
  // Your function logic here
  const response = {
    statusCode: 200,
    body: {
      message: 'Hello from your serverless function!',
      input: event
    }
  };
  
  // Return the response
  callback(null, response);
  return response;
};`;
    } else {
      return `"""
Sample AWS Lambda-style Python function

@param event: Input event from the caller
@param context: Execution context
@return: Response object
"""
def handler(event, context):
    print("Function execution started")
    print(f"Input event: {event}")
    
    # Your function logic here
    response = {
        'statusCode': 200,
        'body': {
            'message': 'Hello from your serverless function!',
            'input': event
        }
    }
    
    return response`;
    }
  };

  return (
    <div>
      <h1 className="mb-4">Create Function</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Function Name*</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <div className="form-text">A unique name for your function</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="runtime" className="form-label">Runtime*</label>
              <select
                className="form-select"
                id="runtime"
                name="runtime"
                value={formData.runtime}
                onChange={handleRuntimeChange}
                required
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python</option>
              </select>
            </div>
            
            <div className="mb-3">
              <label htmlFor="handler" className="form-label">Handler*</label>
              <input
                type="text"
                className="form-control"
                id="handler"
                name="handler"
                value={formData.handler}
                onChange={handleChange}
                required
              />
              <div className="form-text">
                {formData.runtime === 'javascript' ? 'Format: file.function (e.g., index.handler)' : 'Format: file.function (e.g., main.handler)'}
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="timeout" className="form-label">Timeout (seconds)</label>
                <input
                  type="number"
                  className="form-control"
                  id="timeout"
                  name="timeout"
                  value={formData.timeout}
                  onChange={handleChange}
                  min="1"
                  max="300"
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="memorySize" className="form-label">Memory (MB)</label>
                <input
                  type="number"
                  className="form-control"
                  id="memorySize"
                  name="memorySize"
                  value={formData.memorySize}
                  onChange={handleChange}
                  min="64"
                  max="1024"
                  step="64"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Environment Variables</label>
              {envVars.map((env, index) => (
                <div key={index} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="KEY"
                    value={env.key}
                    onChange={(e) => handleEnvVarChange(index, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VALUE"
                    value={env.value}
                    onChange={(e) => handleEnvVarChange(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeEnvVar(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={addEnvVar}
              >
                Add Environment Variable
              </button>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="code" className="form-label">Function Code*</label>
              <textarea
                className="form-control font-monospace"
                id="code"
                name="code"
                value={formData.code || getCodeTemplate()}
                onChange={handleChange}
                rows="20"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/functions')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Function'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFunction;