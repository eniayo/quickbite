#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { QuickBiteSimplifiedStack } from '../lib/quickbite-stack';

const app = new cdk.App();
new QuickBiteSimplifiedStack(app, 'QuickBiteStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  tags: {
    Environment: 'production',
    Project: 'QuickBite',
    Owner: 'DevOps',
  }
});