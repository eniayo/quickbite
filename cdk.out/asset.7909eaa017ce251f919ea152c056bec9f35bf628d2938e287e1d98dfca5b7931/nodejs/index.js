'use strict';

// This module exports the path to the kubectl binary for use in Lambda functions
// In a real implementation, the kubectl binary would be included in the Lambda layer

// Path where kubectl binary would be located in the Lambda environment
const KUBECTL_BINARY_PATH = '/opt/bin/kubectl';

module.exports = {
  // Export the path to the kubectl binary
  KUBECTL_PATH: KUBECTL_BINARY_PATH,
  
  // Helper function to get the path
  getKubectlPath: function() {
    return KUBECTL_BINARY_PATH;
  }
};

