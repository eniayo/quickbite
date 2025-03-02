// File: lib/quickbite-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Simplified QuickBite infrastructure stack
 * This stack focuses on setting up an EKS cluster and the necessary resources
 * to host a web application without the additional complexity of databases and caching.
 */
export class QuickBiteSimplifiedStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC for our application
    const vpc = new ec2.Vpc(this, 'QuickBiteVPC', {
      maxAzs: 2,             // Reduced to 2 AZs for simplicity
      natGateways: 1,        // Single NAT gateway to reduce costs
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        }
      ],
    });

    // Security group for EKS cluster
    const eksSecurityGroup = new ec2.SecurityGroup(this, 'EksSecurityGroup', {
      vpc,
      description: 'Security group for EKS cluster',
      allowAllOutbound: true,
    });

    // Create a kubectl Lambda layer
    const kubectlLayer = new lambda.LayerVersion(this, 'KubectlLayer', {
      code: lambda.Code.fromAsset('lambda-layers/kubectl'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X, lambda.Runtime.PYTHON_3_9, lambda.Runtime.PYTHON_3_11],
      description: 'A layer that contains the kubectl binary',
    });

    // EKS Cluster - simplified configuration
    const cluster = new eks.Cluster(this, 'QuickBiteCluster', {
      version: eks.KubernetesVersion.V1_27,
      vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
      defaultCapacity: 0,
      securityGroup: eksSecurityGroup,
      clusterName: 'quickbite-cluster',
      kubectlLayer: kubectlLayer,
    });

    // Add managed node group - simplified with fewer instances
    cluster.addNodegroupCapacity('ManagedNodes', {
      instanceTypes: [new ec2.InstanceType('t3.medium')],  // Smaller instance
      minSize: 1,      // Start with minimal capacity
      maxSize: 3,      // Reduce maximum to control costs
      desiredSize: 2,
      diskSize: 20,    // Smaller disk size
      subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    // Create ECR repository for the web application
    const webAppRepository = new ecr.Repository(this, 'WebAppRepository', {
      repositoryName: 'quickbite-webapp',
      removalPolicy: cdk.RemovalPolicy.DESTROY,  // For easy cleanup in dev/test
      lifecycleRules: [
        {
          maxImageCount: 5,  // Keep only 5 images to save space
          description: 'Keep only the last 5 images',
        },
      ],
    });

    // Define a Kubernetes namespace for our application
    const appNamespace = cluster.addManifest('AppNamespace', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: { name: 'quickbite' }
    });

    // Deploy the web application - this is a simplified template
    // In a real deployment, you would replace the image with your ECR image
    const webDeployment = cluster.addManifest('WebAppDeployment', {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'quickbite-webapp',
        namespace: 'quickbite'
      },
      spec: {
        replicas: 2,
        selector: {
          matchLabels: { app: 'quickbite-webapp' }
        },
        template: {
          metadata: { labels: { app: 'quickbite-webapp' } },
          spec: {
            containers: [{
              name: 'webapp',
              image: `${webAppRepository.repositoryUri}:latest`,
              ports: [{ containerPort: 80 }],
              resources: {
                requests: {
                  cpu: '200m',    // Reduced resource requests
                  memory: '256Mi'
                },
                limits: {
                  cpu: '500m',    // Reduced resource limits
                  memory: '512Mi'
                }
              }
            }]
          }
        }
      }
    });

    // Make sure the namespace is created before the deployment
    webDeployment.node.addDependency(appNamespace);

    // Create a service to expose the web application
    const webService = cluster.addManifest('WebAppService', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: 'quickbite-webapp',
        namespace: 'quickbite'
      },
      spec: {
        type: 'LoadBalancer', // Simplest way to expose the service externally
        ports: [{ port: 80, targetPort: 80 }],
        selector: { app: 'quickbite-webapp' }
      }
    });

    // Make sure the deployment exists before creating the service
    webService.node.addDependency(webDeployment);

    // Outputs
    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
    });

    new cdk.CfnOutput(this, 'WebAppRepositoryUri', {
      value: webAppRepository.repositoryUri,
    });

    new cdk.CfnOutput(this, 'EksCommandToGetServiceEndpoint', {
      value: `kubectl get svc quickbite-webapp -n quickbite -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'`,
    });
  }
}