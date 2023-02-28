import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

import { join } from 'path';
import { GenericTable } from './GenericTable';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class SpaceStack extends Stack {
  private api = new RestApi(this, 'SpaceApi');
  private spacesTable = new GenericTable('SpacesTable', 'spaceId', this);

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const helloLambdaNodejs = new NodejsFunction(this, 'helloLambdaNodejs', {
      entry: join(__dirname, '..', 'services', 'node-lambda', 'hello.ts'),
      handler: 'handler',
    });

    // Hello Api lambda integration
    const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodejs);
    const helloLambdaResource = this.api.root.addResource('hello');
    helloLambdaResource.addMethod('GET', helloLambdaIntegration);
  }
}
