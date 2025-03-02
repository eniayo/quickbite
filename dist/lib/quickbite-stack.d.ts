import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
/**
 * Simplified QuickBite infrastructure stack
 * This stack focuses on setting up an EKS cluster and the necessary resources
 * to host a web application without the additional complexity of databases and caching.
 */
export declare class QuickBiteSimplifiedStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps);
}
