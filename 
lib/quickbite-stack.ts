    });

    // Create a kubectl Lambda layer
    const kubectlLayer = new lambda.LayerVersion(this, 'KubectlLayer', {
      code: lambda.Code.fromAsset('lambda-layers/kubectl'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X, lambda.Runtime.PYTHON_3_9],
      description: 'A layer that contains the kubectl binary',
    });

    // EKS Cluster - simplified configuration
      defaultCapacity: 0,
      securityGroup: eksSecurityGroup,
      clusterName: 'quickbite-cluster',
      kubectlLayer: kubectlLayer,
    });
