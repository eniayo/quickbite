import { Handler } from 'aws-lambda';
import { exec } from 'child_process';
import * as path from 'path';

export const handler: Handler = async (event, context) => {
  const kubectlPath = path.join('/opt/nodejs/bin', 'kubectl');
  
  return new Promise((resolve, reject) => {
    exec(`${kubectlPath} version --client`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Exec error: ${error}`);
        return reject({
          statusCode: 500,
          body: JSON.stringify({ error: error.message })
        });
      }
      
      resolve({
        statusCode: 200,
        body: JSON.stringify({
          message: 'Kubectl version check successful',
          output: stdout
        })
      });
    });
  });
};