# QuickBite Setup Guide

This guide provides step-by-step instructions for setting up and deploying the QuickBite infrastructure on AWS.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **AWS CLI** - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. **Node.js** (v14 or later) - [Download Node.js](https://nodejs.org/)
3. **Docker** - [Install Docker](https://docs.docker.com/get-docker/)
4. **AWS CDK** - Install globally with `npm install -g aws-cdk`
5. **kubectl** - [Install kubectl](https://kubernetes.io/docs/tasks/tools/)
6. **envsubst** - Usually part of the gettext package on Linux/macOS

## AWS Account Setup

1. Create an AWS account if you don't have one
2. Create an IAM user with programmatic access and necessary permissions
3. Configure AWS CLI:
   ```bash
   aws configure
   ```

## Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/quickbite-infrastructure.git
   cd quickbite-infrastructure
   ```

2. Run the bootstrap script
   ```bash
   chmod +x scripts/bootstrap.sh
   ./scripts/bootstrap.sh
   ```

3. Edit the `.env` file with your AWS account details:
   ```
   AWS_ACCOUNT_ID=your-account-id
   AWS_REGION=your-preferred-region
   CDK_DEFAULT_ACCOUNT=your-account-id
   CDK_DEFAULT_REGION=your-preferred-region
   ```

## Deploying the Infrastructure

You can deploy the entire infrastructure with a single command:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This script:
1. Installs dependencies
2. Builds the CDK project
3. Deploys the AWS infrastructure using CDK
4. Builds and pushes Docker images for the API and Delivery services
5. Deploys the services to the EKS cluster

## Manual Deployment Steps

If you prefer to deploy each component separately:

1. Build and deploy the CDK infrastructure
   ```bash
   npm install
   npm run build
   npm run cdk deploy
   ```

2. Update kubectl configuration
   ```bash
   aws eks update-kubeconfig --name quickbite-cluster --region your-region
   ```

3. Deploy common Kubernetes resources
   ```bash
   kubectl apply -f k8s/common/
   ```

4. Build and deploy the API service
   ```bash
   cd services/api
   npm install
   npm run build
   docker build -t {AWS_ACCOUNT_ID}.dkr.ecr.{AWS_REGION}.amazonaws.com/quickbite-api:latest .
   aws ecr get-login-password --region {AWS_REGION} | docker login --username AWS --password-stdin {AWS_ACCOUNT_ID}.dkr.ecr.{AWS_REGION}.amazonaws.com
   docker push {AWS_ACCOUNT_ID}.dkr.ecr.{AWS_REGION}.amazonaws.com/quickbite-api:latest
   cd ../..
   kubectl apply -f k8s/api-service/
   ```

5. Build and deploy the Delivery service
   ```bash
   cd services/delivery
   npm install
   npm run build
   docker build -t {AWS_ACCOUNT_ID}.dkr.ecr.{AWS_REGION}.amazonaws.com/quickbite-delivery:latest .
   aws ecr get-login-password --region {AWS_REGION} | docker login --username AWS --password-stdin {AWS_ACCOUNT_ID}.dkr.ecr.{AWS_REGION}.amazonaws.com
   docker push {AWS_ACCOUNT_ID}.dkr.ecr.{AWS_REGION}.amazonaws.com/quickbite-delivery:latest
   cd ../..
   kubectl apply -f k8s/delivery-service/
   ```

## Verifying the Deployment

1. Check the status of your pods
   ```bash
   kubectl get pods
   ```

2. Check the services
   ```bash
   kubectl get services
   ```

3. Check the ingress
   ```bash
   kubectl get ingress
   ```

4. Find the ALB DNS name
   ```bash
   kubectl get ingress quickbite-api-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
   ```

5. Test the API endpoints
   ```bash
   curl -v http://<alb-dns-name>/health
   ```

## Local Development

For local development:

1. Set up local environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with appropriate values
   ```

2. Run the API service locally
   ```bash
   cd services/api
   npm run start:dev
   ```

3. Run the Delivery service locally
   ```bash
   cd services/delivery
   npm run start:dev
   ```

## Troubleshooting

1. **CDK Deployment Failures**
   - Check CloudFormation in the AWS Console for specific errors
   - Run `cdk diff` to see what changes will be made before deployment

2. **Container Issues**
   - View pod logs: `kubectl logs <pod-name>`
   - Describe pod for events: `kubectl describe pod <pod-name>`

3. **Networking Issues**
   - Check security groups and VPC configuration
   - Verify that pods can communicate with RDS and Redis

4. **Permission Issues**
   - Verify IAM roles and policies
   - Check Kubernetes RBAC settings

## Cleanup

To destroy the infrastructure and avoid incurring charges:

```bash
npm run cdk destroy
```

Note: This will delete all resources created by CDK, but not ECR repositories or images. To delete those, use the AWS Console or CLI.