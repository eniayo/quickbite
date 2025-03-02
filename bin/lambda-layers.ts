import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class KubectlLayerStack extends cdk.Stack {
  public readonly kubectlLayer: lambda.LayerVersion;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.kubectlLayer = new lambda.LayerVersion(this, 'KubectlLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-layers/kubectl')),
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_20_X,
        lambda.Runtime.NODEJS_18_X
      ],
      description: 'Kubectl utility layer',
    });
  }
}