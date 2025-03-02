#!/bin/bash
set -e

echo "===== QuickBite Infrastructure Bootstrap ====="
echo "Setting up the development environment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install it first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install it first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if CDK is installed globally
if ! command -v cdk &> /dev/null; then
    echo "Installing AWS CDK globally..."
    npm install -g aws-cdk
fi

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# AWS Configuration
AWS_ACCOUNT_ID=
AWS_REGION=
CDK_DEFAULT_ACCOUNT=\${AWS_ACCOUNT_ID}
CDK_DEFAULT_REGION=\${AWS_REGION}

# Application Configuration
APP_ENV=development
EOF

    echo ".env file created. Please edit it with your AWS account details."
else
    echo ".env file already exists."
fi

# Bootstrap CDK in the AWS environment
echo "Would you like to bootstrap CDK in your AWS environment? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # Load environment variables from .env
    if [ -f .env ]; then
        source .env
    fi

    # Check required environment variables
    if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
        echo "Please set AWS_ACCOUNT_ID and AWS_REGION in your .env file first."
        exit 1
    fi

    echo "Bootstrapping CDK in AWS account ${AWS_ACCOUNT_ID}, region ${AWS_REGION}..."
    cdk bootstrap aws://${AWS_ACCOUNT_ID}/${AWS_REGION}
    echo "CDK bootstrap complete."
else
    echo "Skipping CDK bootstrap. You can run 'cdk bootstrap' manually later."
fi

# Create ECR repositories if they don't exist
echo "Would you like to create ECR repositories for the services? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # Load environment variables from .env if they haven't been loaded yet
    if [ -f .env ] && [ -z "$AWS_REGION" ]; then
        source .env
    fi

    # Check required environment variables again
    if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
        echo "Please set AWS_ACCOUNT_ID and AWS_REGION in your .env file first."
        exit 1
    fi

    echo "Creating ECR repositories..."
    aws ecr describe-repositories --repository-names quickbite-api --region ${AWS_REGION} > /dev/null 2>&1 || \
    aws ecr create-repository --repository-name quickbite-api --region ${AWS_REGION}
    
    aws ecr describe-repositories --repository-names quickbite-delivery --region ${AWS_REGION} > /dev/null 2>&1 || \
    aws ecr create-repository --repository-name quickbite-delivery --region ${AWS_REGION}
    
    echo "ECR repositories created or already exist."
else
    echo "Skipping ECR repository creation."
fi

echo "===== Bootstrap Complete ====="
echo "Your development environment is now set up!"
echo "Next steps:"
echo "1. Edit the .env file with your AWS account details if you haven't already."
echo "2. Run 'npm run build' to build the CDK project."
echo "3. Run 'npm run cdk deploy' to deploy the infrastructure to AWS."