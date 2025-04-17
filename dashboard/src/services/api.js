import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

class ApiService {
  // Function endpoints
  static async getFunctions() {
    return axios.get(`${API_URL}/functions`);
  }

  static async getFunction(id) {
    return axios.get(`${API_URL}/functions/${id}`);
  }

  static async createFunction(functionData) {
    return axios.post(`${API_URL}/functions`, functionData);
  }

  static async updateFunction(id, functionData) {
    return axios.put(`${API_URL}/functions/${id}`, functionData);
  }

  static async deleteFunction(id) {
    return axios.delete(`${API_URL}/functions/${id}`);
  }

  // Execution endpoints
  static async getExecutions() {
    return axios.get(`${API_URL}/executions`);
  }

  static async getFunctionExecutions(functionId) {
    return axios.get(`${API_URL}/executions/function/${functionId}`);
  }

  static async getExecution(id) {
    return axios.get(`${API_URL}/executions/${id}`);
  }

  static async invokeFunction(functionId, input, virtualization = 'docker') {
    return axios.post(`${API_URL}/executions/invoke/${functionId}?virtualization=${virtualization}`, input);
  }
}

export default ApiService;