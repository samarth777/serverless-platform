const DockerExecutionEngine = require('./docker/DockerExecutionEngine');
const GVisorExecutionEngine = require('./gvisor/GVisorExecutionEngine');
const logger = require('./utils/logger');

/**
 * Main execution engine class that handles function execution
 * using different virtualization technologies
 */
class ExecutionEngine {
  constructor() {
    this.engines = {
      docker: new DockerExecutionEngine(),
      gvisor: new GVisorExecutionEngine()
      // Additional virtualization technologies will be added here
    };
  }

  /**
   * Execute a function using the specified virtualization technology
   * @param {Object} functionData - The function metadata and code
   * @param {Object} input - The input payload for the function
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} - The execution result
   */
  async executeFunction(functionData, input, options = {}) {
    const technology = options.virtualizationTechnology || 'docker';
    
    if (!this.engines[technology]) {
      throw new Error(`Virtualization technology '${technology}' is not supported`);
    }
    
    logger.info(`Executing function ${functionData.name} using ${technology}`);
    
    return this.engines[technology].executeFunction(functionData, input, options);
  }
}

module.exports = new ExecutionEngine();