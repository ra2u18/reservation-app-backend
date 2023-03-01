import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

import { join } from 'path';
import { GenericTable } from './GenericTable';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class SpaceStack extends Stack {
  private api = new RestApi(this, 'SpaceApi');
  private spacesTable = new GenericTable('SpacesTable', 'spaceId', this);

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const createItem = new NodejsFunction(this, 'createItem', {
      entry: join(__dirname, '..', 'services', 'SpacesTable', 'Create.ts'),
      handler: 'handler',
    });

    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions('dynamodb:PutItem');
    s3ListPolicy.addResources(this.spacesTable.getTableARN());

    createItem.addToRolePolicy(s3ListPolicy);

    // Hello Api lambda integration
    const helloLambdaIntegration = new LambdaIntegration(createItem);
    const helloLambdaResource = this.api.root.addResource('hello');
    helloLambdaResource.addMethod('GET', helloLambdaIntegration);
  }
}
