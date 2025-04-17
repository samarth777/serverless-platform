import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import ApiService from '../services/api';

const FunctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('details');
  const [func, setFunc] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [invocationInput, setInvocationInput] = useState('{\n  "name": "World"\n}');
  const [virtualizationTech, setVirtualizationTech] = useState('docker');
  const [invocationLoading, setInvocationLoading] = useState(false);
  const [invocationResult, setInvocationResult] = useState(null);

  useEffect(() => {
    // Check if we should start on the invoke tab
    if (location.state?.invokeTab) {
      setActiveTab('invoke');
    }
    
    fetchFunctionData();
  }, [id, location.state]);

  const fetchFunctionData = async () => {
    try {
      setLoading(true);
      const [funcResponse, executionsResponse] = await Promise.all([
        ApiService.getFunction(id),
        ApiService.getFunctionExecutions(id)
      ]);
      
      setFunc(funcResponse.data);
      setFormData(funcResponse.data);
      setExecutions(executionsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching function data:', error);
      setError('Failed to fetch function data. Please try again later.');
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'executions') {
      // Refresh executions data when switching to the executions tab
      ApiService.getFunctionExecutions(id)
        .then(response => setExecutions(response.data))
        .catch(error => console.error('Error fetching executions:', error));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await ApiService.updateFunction(id, formData);
      setFunc(formData);
      setEditMode(false);
      setLoading(false);
    } catch (error) {
      console.error('Error updating function:', error);
      setError('Failed to update function. Please try again later.');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the function "${func.name}"?`)) {
      try {
        await ApiService.deleteFunction(id);
        navigate('/functions');
      } catch (error) {
        console.error('Error deleting function:', error);
        setError('Failed to delete function. Please try again later.');
      }
    }
  };

  const handleInvoke = async () => {
    try {
      setInvocationLoading(true);
      setInvocationResult(null);
      
      let inputData;
      try {
        inputData = JSON.parse(invocationInput);
      } catch (e) {
        throw new Error('Invalid JSON input');
      }
      
      const response = await ApiService.invokeFunction(id, inputData, virtualizationTech);
      
      // Start polling for the execution result
      const executionId = response.data.executionId;
      const pollInterval = setInterval(async () => {
        try {
          const executionResponse = await ApiService.getExecution(executionId);
          const execution = executionResponse.data;
          
          if (execution.status !== 'pending' && execution.status !== 'running') {
            clearInterval(pollInterval);
            setInvocationResult(execution);
            setInvocationLoading(false);
            
            // Refresh executions list
            const executionsResponse = await ApiService.getFunctionExecutions(id);
            setExecutions(executionsResponse.data);
          }
        } catch (error) {
          console.error('Error polling execution status:', error);
          clearInterval(pollInterval);
          setInvocationLoading(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Error invoking function:', error);
      setInvocationResult({
        status: 'failed',
        error: error.response?.data?.message || error.message || 'Failed to invoke function'
      });
      setInvocationLoading(false);
    }
  };

  if (loading && !func) {
    return <div className="text-center mt-5"><h3>Loading function...</h3></div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  if (!func) {
    return <div className="alert alert-warning mt-5">Function not found</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{func.name}</h1>
        <div>
          {activeTab === 'details' && !editMode && (
            <>
              <button className="btn btn-primary me-2" onClick={() => setEditMode(true)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </>
          )}
          {activeTab === 'details' && editMode && (
            <>
              <button className="btn btn-secondary me-2" onClick={() => {
                setFormData(func);
                setEditMode(false);
              }}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleSave}>
                Save
              </button>
            </>
          )}
        </div>
      </div>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => handleTabChange('details')}
          >
            Details
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'invoke' ? 'active' : ''}`}
            onClick={() => handleTabChange('invoke')}
          >
            Invoke
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'executions' ? 'active' : ''}`}
            onClick={() => handleTabChange('executions')}
          >
            Executions
          </button>
        </li>
      </ul>
      
      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Configuration</h5>
                <span className={`badge ${func.runtime === 'javascript' ? 'bg-warning' : 'bg-primary'}`}>
                  {func.runtime}
                </span>
              </div>
              <div className="card-body">
                {editMode ? (
                  <form>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Function Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows="2"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="handler" className="form-label">Handler</label>
                      <input
                        type="text"
                        className="form-control"
                        id="handler"
                        name="handler"
                        value={formData.handler}
                        onChange={handleChange}
                        required
                      />
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
                  </form>
                ) : (
                  <div>
                    <p><strong>Description:</strong> {func.description || 'No description provided'}</p>
                    <p><strong>Handler:</strong> {func.handler}</p>
                    <p><strong>Runtime:</strong> {func.runtime}</p>
                    <p><strong>Timeout:</strong> {func.timeout} seconds</p>
                    <p><strong>Memory:</strong> {func.memorySize} MB</p>
                    <p><strong>Created:</strong> {new Date(func.createdAt).toLocaleString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(func.updatedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Function Code</h5>
              </div>
              <div className="card-body">
                {editMode ? (
                  <textarea
                    className="form-control font-monospace"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    rows="15"
                    required
                  />
                ) : (
                  <pre className="p-3 bg-light rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
                    <code>{func.code}</code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Invoke Tab */}
      {activeTab === 'invoke' && (
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Invoke Function</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="invocationInput" className="form-label">Input JSON</label>
                  <textarea
                    className="form-control font-monospace"
                    id="invocationInput"
                    value={invocationInput}
                    onChange={(e) => setInvocationInput(e.target.value)}
                    rows="10"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="virtualizationTech" className="form-label">Virtualization Technology</label>
                  <select
                    className="form-select"
                    id="virtualizationTech"
                    value={virtualizationTech}
                    onChange={(e) => setVirtualizationTech(e.target.value)}
                  >
                    <option value="docker">Docker Container</option>
                    <option value="gvisor">gVisor Container Runtime</option>
                    <option value="firecracker" disabled>Firecracker MicroVM (Coming Soon)</option>
                  </select>
                </div>
                
                <button
                  className="btn btn-primary"
                  onClick={handleInvoke}
                  disabled={invocationLoading}
                >
                  {invocationLoading ? 'Invoking...' : 'Invoke Function'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Execution Result</h5>
              </div>
              <div className="card-body">
                {invocationLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Function is executing...</p>
                  </div>
                ) : invocationResult ? (
                  <div>
                    <div className="mb-3">
                      <span className={`badge status-${invocationResult.status}`}>
                        {invocationResult.status}
                      </span>
                      {invocationResult.duration && (
                        <span className="ms-2 text-muted">
                          Duration: {invocationResult.duration}ms
                        </span>
                      )}
                    </div>
                    
                    {invocationResult.error ? (
                      <div className="alert alert-danger">
                        {invocationResult.error}
                      </div>
                    ) : (
                      <div>
                        <h6>Output:</h6>
                        <pre className="p-3 bg-light rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                          <code>{JSON.stringify(invocationResult.output, null, 2)}</code>
                        </pre>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <h6>Logs:</h6>
                      <div className="execution-log">
                        {invocationResult.logs && invocationResult.logs.length > 0 ? (
                          invocationResult.logs.map((log, index) => (
                            <div key={index}>{log}</div>
                          ))
                        ) : (
                          <div className="text-muted">No logs available</div>
                        )}
                      </div>
                    </div>
                    
                    {invocationResult.memoryUsage && (
                      <div className="mt-3">
                        <h6>Resource Usage:</h6>
                        <p>Memory: {invocationResult.memoryUsage} MB</p>
                        <p>CPU: {invocationResult.cpuUsage}%</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">Invoke the function to see results here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Executions Tab */}
      {activeTab === 'executions' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Recent Executions</h5>
          </div>
          <div className="card-body">
            {executions.length === 0 ? (
              <div className="text-center py-3">
                <p>No executions found for this function.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleTabChange('invoke')}
                >
                  Invoke Function
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Status</th>
                      <th>Duration</th>
                      <th>Start Time</th>
                      <th>Memory</th>
                      <th>Virtualization</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.map(execution => (
                      <tr key={execution._id}>
                        <td>{execution._id.substring(0, 8)}...</td>
                        <td>
                          <span className={`badge status-${execution.status}`}>
                            {execution.status}
                          </span>
                        </td>
                        <td>{execution.duration ? `${execution.duration}ms` : 'N/A'}</td>
                        <td>{new Date(execution.startTime).toLocaleString()}</td>
                        <td>{execution.memoryUsage ? `${execution.memoryUsage}MB` : 'N/A'}</td>
                        <td>{execution.virtualizationTechnology}</td>
                        <td>
                          <Link to={`/executions/${execution._id}`} className="btn btn-sm btn-outline-primary">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionDetail;