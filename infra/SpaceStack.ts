import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { AuthorizationType, MethodOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';

import { GenericTable } from './GenericTable';
import { AuthorizerWrapper } from './auth/AuthorizerWrapper';

export class SpaceStack extends Stack {
  private api = new RestApi(this, 'SpaceApi');
  private spacesTable = new GenericTable(this, {
    tableName: 'SpacesTable',
    primaryKey: 'spaceId',

    createLambdaPath: 'Create',
    updateLambdaPath: 'Update',
    readLambdaPath: 'Read',
    deleteLambdaPath: 'Delete',

    secondaryIndexes: ['location'],
  });

  private authorizer: AuthorizerWrapper;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.authorizer = new AuthorizerWrapper(this, this.api);

    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId,
      },
    };

    // Spaces API integrations
    const spaceResource = this.api.root.addResource('spaces');
    spaceResource.addMethod(
      'POST',
      this.spacesTable.createLambdaIntegration,
      optionsWithAuthorizer
    );
    spaceResource.addMethod(
      'GET',
      this.spacesTable.readLambdaIntegration,
      optionsWithAuthorizer
    );
    spaceResource.addMethod('PUT', this.spacesTable.updateLambdaIntegration);
    spaceResource.addMethod('DELETE', this.spacesTable.deleteLambdaIntegration);
  }
}
