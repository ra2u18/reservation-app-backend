import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';

import { GenericTable } from './GenericTable';

export class SpaceStack extends Stack {
  private api = new RestApi(this, 'SpaceApi');
  private spacesTable = new GenericTable(this, {
    tableName: 'SpacesTable',
    primaryKey: 'spaceId',
    createLambdaPath: 'Create',
    readLambdaPath: 'Read',
  });

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Spaces API integrations
    const spaceResource = this.api.root.addResource('spaces');
    spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration);
    spaceResource.addMethod('GET', this.spacesTable.readLambdaIntegration);
  }
}
