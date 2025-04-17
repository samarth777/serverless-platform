import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';

const Functions = () => {
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getFunctions();
        setFunctions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching functions:', error);
        setError('Failed to fetch functions. Please try again later.');
        setLoading(false);
      }
    };

    fetchFunctions();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the function "${name}"?`)) {
      try {
        await ApiService.deleteFunction(id);
        setFunctions(functions.filter(func => func._id !== id));
      } catch (error) {
        console.error('Error deleting function:', error);
        setError('Failed to delete function. Please try again later.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><h3>Loading functions...</h3></div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Functions</h1>
        <Link to="/functions/new" className="btn btn-primary">
          <i className="bi bi-plus"></i> New Function
        </Link>
      </div>

      {functions.length === 0 ? (
        <div className="text-center py-5">
          <h4>No functions found</h4>
          <p>Create your first serverless function to get started.</p>
          <Link to="/functions/new" className="btn btn-primary mt-3">
            Create Function
          </Link>
        </div>
      ) : (
        <div className="row">
          {functions.map(func => (
            <div key={func._id} className="col-md-4 mb-4">
              <div className="card function-card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{func.name}</h5>
                  <span className={`badge ${func.runtime === 'javascript' ? 'bg-warning' : 'bg-primary'}`}>
                    {func.runtime}
                  </span>
                </div>
                <div className="card-body">
                  <p className="card-text">{func.description || 'No description provided.'}</p>
                  <div className="mb-3">
                    <small className="text-muted">
                      <strong>Handler:</strong> {func.handler}
                    </small>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">
                      <strong>Memory:</strong> {func.memorySize}MB | <strong>Timeout:</strong> {func.timeout}s
                    </small>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">
                      <strong>Created:</strong> {new Date(func.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <div>
                    <Link to={`/functions/${func._id}`} className="btn btn-sm btn-outline-primary me-2">
                      Details
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(func._id, func.name)}
                    >
                      Delete
                    </button>
                  </div>
                  <Link 
                    to={`/functions/${func._id}`} 
                    state={{ invokeTab: true }}
                    className="btn btn-sm btn-success"
                  >
                    Invoke
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Functions;