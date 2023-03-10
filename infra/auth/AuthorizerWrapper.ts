import { CfnOutput } from 'aws-cdk-lib';
import { CognitoUserPoolsAuthorizer, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { CfnUserPoolGroup, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

import { IdentityPoolWrapper } from './IdentityPoolWrapper';

export class AuthorizerWrapper {
  private scope: Construct;
  private api: RestApi;
  private photoBucketARN: string;

  private userPool: UserPool;
  private userPoolClient: UserPoolClient;
  private identityPoolWrapper: IdentityPoolWrapper;

  public authorizer: CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, api: RestApi, photoBucketARN: string) {
    this.scope = scope;
    this.api = api;
    this.photoBucketARN = photoBucketARN;

    this.initialize();
  }

  private initialize() {
    this.createUserPool();
    this.addUserPoolClient();
    this.createAuthorizer();
    this.initializeIdentityPoolWrapper();
    this.createAdminsGroup();
  }

  private createUserPool() {
    this.userPool = new UserPool(this.scope, 'SpaceUserPool', {
      userPoolName: 'SpaceUserPool',
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
    });

    new CfnOutput(this.scope, 'UserPoolId', {
      value: this.userPool.userPoolId,
    });
  }

  private addUserPoolClient() {
    this.userPoolClient = this.userPool.addClient('SpaceUserPool-client', {
      userPoolClientName: 'SpaceUserPool-client',
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
    });

    new CfnOutput(this.scope, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
    });
  }

  private createAuthorizer() {
    this.authorizer = new CognitoUserPoolsAuthorizer(this.scope, 'SpaceUserAuthorizer', {
      cognitoUserPools: [this.userPool],
      authorizerName: 'SpaceUserAuthorizer',
      identitySource: 'method.request.header.Authorization',
    });
    this.authorizer._attachToApi(this.api);
  }

  private initializeIdentityPoolWrapper() {
    this.identityPoolWrapper = new IdentityPoolWrapper(
      this.scope,
      this.userPool,
      this.userPoolClient,
      this.photoBucketARN
    );
  }

  private createAdminsGroup() {
    new CfnUserPoolGroup(this.scope, 'Admins', {
      groupName: 'Admins',
      userPoolId: this.userPool.userPoolId,
      roleArn: this.identityPoolWrapper.adminRole.roleArn,
    });
  }
}
