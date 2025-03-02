"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickBiteSimplifiedStack = void 0;
// File: lib/quickbite-stack.ts
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const eks = require("aws-cdk-lib/aws-eks");
const ecr = require("aws-cdk-lib/aws-ecr");
const lambda = require("aws-cdk-lib/aws-lambda");
/**
 * Simplified QuickBite infrastructure stack
 * This stack focuses on setting up an EKS cluster and the necessary resources
 * to host a web application without the additional complexity of databases and caching.
 */
class QuickBiteSimplifiedStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // VPC for our application
        const vpc = new ec2.Vpc(this, 'QuickBiteVPC', {
            maxAzs: 2,
            natGateways: 1,
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
            instanceTypes: [new ec2.InstanceType('t3.medium')],
            minSize: 1,
            maxSize: 3,
            desiredSize: 2,
            diskSize: 20,
            subnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        });
        // Create ECR repository for the web application
        const webAppRepository = new ecr.Repository(this, 'WebAppRepository', {
            repositoryName: 'quickbite-webapp',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            lifecycleRules: [
                {
                    maxImageCount: 5,
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
                                        cpu: '200m',
                                        memory: '256Mi'
                                    },
                                    limits: {
                                        cpu: '500m',
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
                type: 'LoadBalancer',
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
exports.QuickBiteSimplifiedStack = QuickBiteSimplifiedStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tiaXRlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3F1aWNrYml0ZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBK0I7QUFDL0IsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQywyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBRTNDLGlEQUFpRDtBQUdqRDs7OztHQUlHO0FBQ0gsTUFBYSx3QkFBeUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNyRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDBCQUEwQjtRQUMxQixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUM1QyxNQUFNLEVBQUUsQ0FBQztZQUNULFdBQVcsRUFBRSxDQUFDO1lBQ2QsbUJBQW1CLEVBQUU7Z0JBQ25CO29CQUNFLElBQUksRUFBRSxRQUFRO29CQUNkLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU07b0JBQ2pDLFFBQVEsRUFBRSxFQUFFO2lCQUNiO2dCQUNEO29CQUNFLElBQUksRUFBRSxTQUFTO29CQUNmLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLG1CQUFtQjtvQkFDOUMsUUFBUSxFQUFFLEVBQUU7aUJBQ2I7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILGlDQUFpQztRQUNqQyxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDdkUsR0FBRztZQUNILFdBQVcsRUFBRSxnQ0FBZ0M7WUFDN0MsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFFSCxnQ0FBZ0M7UUFDaEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDakUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDO1lBQ3BELGtCQUFrQixFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFDdkcsV0FBVyxFQUFFLDBDQUEwQztTQUN4RCxDQUFDLENBQUM7UUFFSCx5Q0FBeUM7UUFDekMsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUN4RCxPQUFPLEVBQUUsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEtBQUs7WUFDcEMsR0FBRztZQUNILFVBQVUsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUNoRSxlQUFlLEVBQUUsQ0FBQztZQUNsQixhQUFhLEVBQUUsZ0JBQWdCO1lBQy9CLFdBQVcsRUFBRSxtQkFBbUI7WUFDaEMsWUFBWSxFQUFFLFlBQVk7U0FDM0IsQ0FBQyxDQUFDO1FBRUgsMkRBQTJEO1FBQzNELE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLEVBQUU7WUFDM0MsYUFBYSxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2xELE9BQU8sRUFBRSxDQUFDO1lBQ1YsT0FBTyxFQUFFLENBQUM7WUFDVixXQUFXLEVBQUUsQ0FBQztZQUNkLFFBQVEsRUFBRSxFQUFFO1lBQ1osT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLEVBQUU7U0FDNUQsQ0FBQyxDQUFDO1FBRUgsZ0RBQWdEO1FBQ2hELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNwRSxjQUFjLEVBQUUsa0JBQWtCO1lBQ2xDLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsY0FBYyxFQUFFO2dCQUNkO29CQUNFLGFBQWEsRUFBRSxDQUFDO29CQUNoQixXQUFXLEVBQUUsNkJBQTZCO2lCQUMzQzthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsb0RBQW9EO1FBQ3BELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFO1lBQ3ZELFVBQVUsRUFBRSxJQUFJO1lBQ2hCLElBQUksRUFBRSxXQUFXO1lBQ2pCLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7U0FDaEMsQ0FBQyxDQUFDO1FBRUgsNkRBQTZEO1FBQzdELHdFQUF3RTtRQUN4RSxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFO1lBQzVELFVBQVUsRUFBRSxTQUFTO1lBQ3JCLElBQUksRUFBRSxZQUFZO1lBQ2xCLFFBQVEsRUFBRTtnQkFDUixJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixTQUFTLEVBQUUsV0FBVzthQUN2QjtZQUNELElBQUksRUFBRTtnQkFDSixRQUFRLEVBQUUsQ0FBQztnQkFDWCxRQUFRLEVBQUU7b0JBQ1IsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFO2lCQUN6QztnQkFDRCxRQUFRLEVBQUU7b0JBQ1IsUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLEVBQUU7b0JBQ2pELElBQUksRUFBRTt3QkFDSixVQUFVLEVBQUUsQ0FBQztnQ0FDWCxJQUFJLEVBQUUsUUFBUTtnQ0FDZCxLQUFLLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLFNBQVM7Z0NBQ2pELEtBQUssRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxDQUFDO2dDQUM5QixTQUFTLEVBQUU7b0NBQ1QsUUFBUSxFQUFFO3dDQUNSLEdBQUcsRUFBRSxNQUFNO3dDQUNYLE1BQU0sRUFBRSxPQUFPO3FDQUNoQjtvQ0FDRCxNQUFNLEVBQUU7d0NBQ04sR0FBRyxFQUFFLE1BQU07d0NBQ1gsTUFBTSxFQUFFLE9BQU87cUNBQ2hCO2lDQUNGOzZCQUNGLENBQUM7cUJBQ0g7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILDJEQUEyRDtRQUMzRCxhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUvQyxpREFBaUQ7UUFDakQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUU7WUFDdEQsVUFBVSxFQUFFLElBQUk7WUFDaEIsSUFBSSxFQUFFLFNBQVM7WUFDZixRQUFRLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLGtCQUFrQjtnQkFDeEIsU0FBUyxFQUFFLFdBQVc7YUFDdkI7WUFDRCxJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQ3JDLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxrQkFBa0IsRUFBRTthQUN0QztTQUNGLENBQUMsQ0FBQztRQUVILDhEQUE4RDtRQUM5RCxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUU3QyxVQUFVO1FBQ1YsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDckMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXO1NBQzNCLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDN0MsS0FBSyxFQUFFLGdCQUFnQixDQUFDLGFBQWE7U0FDdEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxnQ0FBZ0MsRUFBRTtZQUN4RCxLQUFLLEVBQUUsd0dBQXdHO1NBQ2hILENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQW5KRCw0REFtSkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBGaWxlOiBsaWIvcXVpY2tiaXRlLXN0YWNrLnRzXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgZWtzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0ICogYXMgZWNyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3InO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbi8qKlxuICogU2ltcGxpZmllZCBRdWlja0JpdGUgaW5mcmFzdHJ1Y3R1cmUgc3RhY2tcbiAqIFRoaXMgc3RhY2sgZm9jdXNlcyBvbiBzZXR0aW5nIHVwIGFuIEVLUyBjbHVzdGVyIGFuZCB0aGUgbmVjZXNzYXJ5IHJlc291cmNlc1xuICogdG8gaG9zdCBhIHdlYiBhcHBsaWNhdGlvbiB3aXRob3V0IHRoZSBhZGRpdGlvbmFsIGNvbXBsZXhpdHkgb2YgZGF0YWJhc2VzIGFuZCBjYWNoaW5nLlxuICovXG5leHBvcnQgY2xhc3MgUXVpY2tCaXRlU2ltcGxpZmllZFN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gVlBDIGZvciBvdXIgYXBwbGljYXRpb25cbiAgICBjb25zdCB2cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCAnUXVpY2tCaXRlVlBDJywge1xuICAgICAgbWF4QXpzOiAyLCAgICAgICAgICAgICAvLyBSZWR1Y2VkIHRvIDIgQVpzIGZvciBzaW1wbGljaXR5XG4gICAgICBuYXRHYXRld2F5czogMSwgICAgICAgIC8vIFNpbmdsZSBOQVQgZ2F0ZXdheSB0byByZWR1Y2UgY29zdHNcbiAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdwdWJsaWMnLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyxcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAncHJpdmF0ZScsXG4gICAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTUyxcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICAvLyBTZWN1cml0eSBncm91cCBmb3IgRUtTIGNsdXN0ZXJcbiAgICBjb25zdCBla3NTZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdFa3NTZWN1cml0eUdyb3VwJywge1xuICAgICAgdnBjLFxuICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBncm91cCBmb3IgRUtTIGNsdXN0ZXInLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhIGt1YmVjdGwgTGFtYmRhIGxheWVyXG4gICAgY29uc3Qga3ViZWN0bExheWVyID0gbmV3IGxhbWJkYS5MYXllclZlcnNpb24odGhpcywgJ0t1YmVjdGxMYXllcicsIHtcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhLWxheWVycy9rdWJlY3RsJyksXG4gICAgICBjb21wYXRpYmxlUnVudGltZXM6IFtsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCwgbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOSwgbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTFdLFxuICAgICAgZGVzY3JpcHRpb246ICdBIGxheWVyIHRoYXQgY29udGFpbnMgdGhlIGt1YmVjdGwgYmluYXJ5JyxcbiAgICB9KTtcblxuICAgIC8vIEVLUyBDbHVzdGVyIC0gc2ltcGxpZmllZCBjb25maWd1cmF0aW9uXG4gICAgY29uc3QgY2x1c3RlciA9IG5ldyBla3MuQ2x1c3Rlcih0aGlzLCAnUXVpY2tCaXRlQ2x1c3RlcicsIHtcbiAgICAgIHZlcnNpb246IGVrcy5LdWJlcm5ldGVzVmVyc2lvbi5WMV8yNyxcbiAgICAgIHZwYyxcbiAgICAgIHZwY1N1Ym5ldHM6IFt7IHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBSSVZBVEVfV0lUSF9FR1JFU1MgfV0sXG4gICAgICBkZWZhdWx0Q2FwYWNpdHk6IDAsXG4gICAgICBzZWN1cml0eUdyb3VwOiBla3NTZWN1cml0eUdyb3VwLFxuICAgICAgY2x1c3Rlck5hbWU6ICdxdWlja2JpdGUtY2x1c3RlcicsXG4gICAgICBrdWJlY3RsTGF5ZXI6IGt1YmVjdGxMYXllcixcbiAgICB9KTtcblxuICAgIC8vIEFkZCBtYW5hZ2VkIG5vZGUgZ3JvdXAgLSBzaW1wbGlmaWVkIHdpdGggZmV3ZXIgaW5zdGFuY2VzXG4gICAgY2x1c3Rlci5hZGROb2RlZ3JvdXBDYXBhY2l0eSgnTWFuYWdlZE5vZGVzJywge1xuICAgICAgaW5zdGFuY2VUeXBlczogW25ldyBlYzIuSW5zdGFuY2VUeXBlKCd0My5tZWRpdW0nKV0sICAvLyBTbWFsbGVyIGluc3RhbmNlXG4gICAgICBtaW5TaXplOiAxLCAgICAgIC8vIFN0YXJ0IHdpdGggbWluaW1hbCBjYXBhY2l0eVxuICAgICAgbWF4U2l6ZTogMywgICAgICAvLyBSZWR1Y2UgbWF4aW11bSB0byBjb250cm9sIGNvc3RzXG4gICAgICBkZXNpcmVkU2l6ZTogMixcbiAgICAgIGRpc2tTaXplOiAyMCwgICAgLy8gU21hbGxlciBkaXNrIHNpemVcbiAgICAgIHN1Ym5ldHM6IHsgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTUyB9LFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIEVDUiByZXBvc2l0b3J5IGZvciB0aGUgd2ViIGFwcGxpY2F0aW9uXG4gICAgY29uc3Qgd2ViQXBwUmVwb3NpdG9yeSA9IG5ldyBlY3IuUmVwb3NpdG9yeSh0aGlzLCAnV2ViQXBwUmVwb3NpdG9yeScsIHtcbiAgICAgIHJlcG9zaXRvcnlOYW1lOiAncXVpY2tiaXRlLXdlYmFwcCcsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAgLy8gRm9yIGVhc3kgY2xlYW51cCBpbiBkZXYvdGVzdFxuICAgICAgbGlmZWN5Y2xlUnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1heEltYWdlQ291bnQ6IDUsICAvLyBLZWVwIG9ubHkgNSBpbWFnZXMgdG8gc2F2ZSBzcGFjZVxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnS2VlcCBvbmx5IHRoZSBsYXN0IDUgaW1hZ2VzJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICAvLyBEZWZpbmUgYSBLdWJlcm5ldGVzIG5hbWVzcGFjZSBmb3Igb3VyIGFwcGxpY2F0aW9uXG4gICAgY29uc3QgYXBwTmFtZXNwYWNlID0gY2x1c3Rlci5hZGRNYW5pZmVzdCgnQXBwTmFtZXNwYWNlJywge1xuICAgICAgYXBpVmVyc2lvbjogJ3YxJyxcbiAgICAgIGtpbmQ6ICdOYW1lc3BhY2UnLFxuICAgICAgbWV0YWRhdGE6IHsgbmFtZTogJ3F1aWNrYml0ZScgfVxuICAgIH0pO1xuXG4gICAgLy8gRGVwbG95IHRoZSB3ZWIgYXBwbGljYXRpb24gLSB0aGlzIGlzIGEgc2ltcGxpZmllZCB0ZW1wbGF0ZVxuICAgIC8vIEluIGEgcmVhbCBkZXBsb3ltZW50LCB5b3Ugd291bGQgcmVwbGFjZSB0aGUgaW1hZ2Ugd2l0aCB5b3VyIEVDUiBpbWFnZVxuICAgIGNvbnN0IHdlYkRlcGxveW1lbnQgPSBjbHVzdGVyLmFkZE1hbmlmZXN0KCdXZWJBcHBEZXBsb3ltZW50Jywge1xuICAgICAgYXBpVmVyc2lvbjogJ2FwcHMvdjEnLFxuICAgICAga2luZDogJ0RlcGxveW1lbnQnLFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgbmFtZTogJ3F1aWNrYml0ZS13ZWJhcHAnLFxuICAgICAgICBuYW1lc3BhY2U6ICdxdWlja2JpdGUnXG4gICAgICB9LFxuICAgICAgc3BlYzoge1xuICAgICAgICByZXBsaWNhczogMixcbiAgICAgICAgc2VsZWN0b3I6IHtcbiAgICAgICAgICBtYXRjaExhYmVsczogeyBhcHA6ICdxdWlja2JpdGUtd2ViYXBwJyB9XG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgICAgbWV0YWRhdGE6IHsgbGFiZWxzOiB7IGFwcDogJ3F1aWNrYml0ZS13ZWJhcHAnIH0gfSxcbiAgICAgICAgICBzcGVjOiB7XG4gICAgICAgICAgICBjb250YWluZXJzOiBbe1xuICAgICAgICAgICAgICBuYW1lOiAnd2ViYXBwJyxcbiAgICAgICAgICAgICAgaW1hZ2U6IGAke3dlYkFwcFJlcG9zaXRvcnkucmVwb3NpdG9yeVVyaX06bGF0ZXN0YCxcbiAgICAgICAgICAgICAgcG9ydHM6IFt7IGNvbnRhaW5lclBvcnQ6IDgwIH1dLFxuICAgICAgICAgICAgICByZXNvdXJjZXM6IHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0czoge1xuICAgICAgICAgICAgICAgICAgY3B1OiAnMjAwbScsICAgIC8vIFJlZHVjZWQgcmVzb3VyY2UgcmVxdWVzdHNcbiAgICAgICAgICAgICAgICAgIG1lbW9yeTogJzI1Nk1pJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbGltaXRzOiB7XG4gICAgICAgICAgICAgICAgICBjcHU6ICc1MDBtJywgICAgLy8gUmVkdWNlZCByZXNvdXJjZSBsaW1pdHNcbiAgICAgICAgICAgICAgICAgIG1lbW9yeTogJzUxMk1pJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgbmFtZXNwYWNlIGlzIGNyZWF0ZWQgYmVmb3JlIHRoZSBkZXBsb3ltZW50XG4gICAgd2ViRGVwbG95bWVudC5ub2RlLmFkZERlcGVuZGVuY3koYXBwTmFtZXNwYWNlKTtcblxuICAgIC8vIENyZWF0ZSBhIHNlcnZpY2UgdG8gZXhwb3NlIHRoZSB3ZWIgYXBwbGljYXRpb25cbiAgICBjb25zdCB3ZWJTZXJ2aWNlID0gY2x1c3Rlci5hZGRNYW5pZmVzdCgnV2ViQXBwU2VydmljZScsIHtcbiAgICAgIGFwaVZlcnNpb246ICd2MScsXG4gICAgICBraW5kOiAnU2VydmljZScsXG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBuYW1lOiAncXVpY2tiaXRlLXdlYmFwcCcsXG4gICAgICAgIG5hbWVzcGFjZTogJ3F1aWNrYml0ZSdcbiAgICAgIH0sXG4gICAgICBzcGVjOiB7XG4gICAgICAgIHR5cGU6ICdMb2FkQmFsYW5jZXInLCAvLyBTaW1wbGVzdCB3YXkgdG8gZXhwb3NlIHRoZSBzZXJ2aWNlIGV4dGVybmFsbHlcbiAgICAgICAgcG9ydHM6IFt7IHBvcnQ6IDgwLCB0YXJnZXRQb3J0OiA4MCB9XSxcbiAgICAgICAgc2VsZWN0b3I6IHsgYXBwOiAncXVpY2tiaXRlLXdlYmFwcCcgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBkZXBsb3ltZW50IGV4aXN0cyBiZWZvcmUgY3JlYXRpbmcgdGhlIHNlcnZpY2VcbiAgICB3ZWJTZXJ2aWNlLm5vZGUuYWRkRGVwZW5kZW5jeSh3ZWJEZXBsb3ltZW50KTtcblxuICAgIC8vIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ2x1c3Rlck5hbWUnLCB7XG4gICAgICB2YWx1ZTogY2x1c3Rlci5jbHVzdGVyTmFtZSxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdXZWJBcHBSZXBvc2l0b3J5VXJpJywge1xuICAgICAgdmFsdWU6IHdlYkFwcFJlcG9zaXRvcnkucmVwb3NpdG9yeVVyaSxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdFa3NDb21tYW5kVG9HZXRTZXJ2aWNlRW5kcG9pbnQnLCB7XG4gICAgICB2YWx1ZTogYGt1YmVjdGwgZ2V0IHN2YyBxdWlja2JpdGUtd2ViYXBwIC1uIHF1aWNrYml0ZSAtbyBqc29ucGF0aD0ney5zdGF0dXMubG9hZEJhbGFuY2VyLmluZ3Jlc3NbMF0uaG9zdG5hbWV9J2AsXG4gICAgfSk7XG4gIH1cbn0iXX0=