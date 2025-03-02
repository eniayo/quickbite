#!/bin/bash
set -e

echo "===== QuickBite Simplified Deployment ====="
echo "Starting deployment process..."

# Check required environment variables
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
  echo "Setting default environment variables..."
  export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  export AWS_REGION=$(aws configure get region)
  echo "Using AWS Account: $AWS_ACCOUNT_ID in Region: $AWS_REGION"
fi

# Step 1: Install dependencies
echo "Installing dependencies..."
npm install

# Step 2: Build the CDK project
echo "Building CDK project..."
npm run build

# Step 3: Check if the stack exists and is in a failed state
STACK_STATUS=$(aws cloudformation describe-stacks --stack-name QuickBiteStack 2>/dev/null | jq -r '.Stacks[0].StackStatus' || echo "STACK_NOT_FOUND")

if [ "$STACK_STATUS" = "STACK_NOT_FOUND" ]; then
  echo "Stack does not exist, proceeding with creation..."
elif [[ "$STACK_STATUS" == *"FAILED"* || "$STACK_STATUS" == "ROLLBACK_COMPLETE" ]]; then
  echo "Stack is in $STACK_STATUS state. Deleting before deploying again..."
  aws cloudformation delete-stack --stack-name QuickBiteStack
  echo "Waiting for stack deletion to complete..."
  aws cloudformation wait stack-delete-complete --stack-name QuickBiteStack
  echo "Stack deleted successfully."
else
  echo "Stack exists in state: $STACK_STATUS. Proceeding with update."
fi

# Step 4: Deploy the AWS infrastructure using CDK
echo "Deploying AWS infrastructure..."
npx cdk deploy QuickBiteStack --require-approval never

# Step 5: Build and push the web app Docker image
echo "Building and pushing web app Docker image..."

# Navigate to frontend directory
cd services/frontend

# Check if directory exists and has necessary files
if [ ! -d "src" ] || [ ! -f "package.json" ]; then
  echo "Frontend source directory not found or missing required files."
  echo "Creating basic React app structure..."
  
  # Create basic app structure if needed
  npx create-react-app .
fi

# Install dependencies and build
npm install
npm run build

# Check if Dockerfile.simplified exists
if [ ! -f "Dockerfile.simplified" ]; then
  echo "Creating simplified Dockerfile..."
  cat > Dockerfile.simplified << 'EOF'
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage - simplified to use Nginx
FROM nginx:alpine

# Copy built app to Nginx serve directory
COPY --from=build /app/build /usr/share/nginx/html

# Create basic Nginx configuration
COPY nginx.simplified.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
EOF
fi

# Check if nginx config exists
if [ ! -f "nginx.simplified.conf" ]; then
  echo "Creating simplified Nginx configuration..."
  cat > nginx.simplified.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    # Compression
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_min_length 256;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Simple health check for Kubernetes
    location /health {
        access_log off;
        return 200 "healthy\n";
    }

    # Error handling
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t quickbite-webapp:latest -f Dockerfile.simplified .

# Create ECR repository if it doesn't exist
echo "Ensuring ECR repository exists..."
aws ecr describe-repositories --repository-names quickbite-webapp >/dev/null 2>&1 || \
aws ecr create-repository --repository-name quickbite-webapp

# Tag and push to ECR
echo "Pushing image to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
docker tag quickbite-webapp:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/quickbite-webapp:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/quickbite-webapp:latest

cd ../..

# Step 6: Update Kubernetes configuration
echo "Updating Kubernetes configuration..."
aws eks update-kubeconfig --name quickbite-cluster --region ${AWS_REGION}

# Step 7: Wait for deployment to be ready and get the endpoint
echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/quickbite-webapp -n quickbite --timeout=300s 2>/dev/null || echo "Deployment not found or not ready yet"

echo "Getting service endpoint..."
SERVICE_URL=$(kubectl get svc quickbite-webapp -n quickbite -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "Not available yet")

echo "===== Deployment Complete ====="
if [ "$SERVICE_URL" != "Not available yet" ]; then
  echo "Your application should be available soon at: http://${SERVICE_URL}"
  echo "Note: It may take a few minutes for DNS to propagate and the service to be fully available."
else
  echo "Application endpoint is not yet available. You can check the status with:"
  echo "kubectl get svc quickbite-webapp -n quickbite"
fi