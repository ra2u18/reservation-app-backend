import { Construct } from 'constructs';
import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { CfnOutput, Fn, Stack, StackProps } from 'aws-cdk-lib';
import { AuthorizationType, MethodOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';

import { GenericTable } from './GenericTable';
import { AuthorizerWrapper } from './auth/AuthorizerWrapper';

export class SpaceStack extends Stack {
  private api = new RestApi(this, 'SpaceApi');
  private authorizer: AuthorizerWrapper;
  private suffix: string;
  private spacesPhotosBucket: Bucket;

  private spacesTable = new GenericTable(this, {
    tableName: 'SpacesTable',
    primaryKey: 'spaceId',

    createLambdaPath: 'Create',
    updateLambdaPath: 'Update',
    readLambdaPath: 'Read',
    deleteLambdaPath: 'Delete',

    secondaryIndexes: ['location'],
  });

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.initializeSuffix();
    this.initializeSpacesPhotosBucket();
    this.authorizer = new AuthorizerWrapper(this, this.api, this.spacesPhotosBucket.bucketArn + '/*');
    
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

  private initializeSuffix() {
    const shortStackId = Fn.select(2, Fn.split('/', this.stackId));
    this.suffix = Fn.select(4, Fn.split('-', shortStackId));
  }

  private initializeSpacesPhotosBucket() {
    this.spacesPhotosBucket = new Bucket(this, 'spaces-photos', {
      bucketName: `spaces-photos-${this.suffix}`,
      cors: [{
        allowedMethods: [
          HttpMethods.HEAD,
          HttpMethods.GET,
          HttpMethods.PUT
        ],
        allowedOrigins: ['*'],
        allowedHeaders: ['*']
      }]
    });

    new CfnOutput(this, 'spaces-photos-bucket-name', {
      value: this.spacesPhotosBucket.bucketName
    });
  }
}
