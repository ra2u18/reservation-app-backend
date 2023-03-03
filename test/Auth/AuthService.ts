import { Auth } from 'aws-amplify';
import { Amplify } from 'aws-amplify';
import { config } from './config';
import { CognitoUser } from '@aws-amplify/auth';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: config.REGION,
    userPoolId: config.USER_POOL_ID,
    userPoolWebClientId: config.APP_CLIENT_ID,
    identityPoolId: config.IDENTITY_POOL_ID,
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },
});

export class AuthService {
  public async login(userName: string, password: string) {
    const user = (await Auth.signIn(userName, password)) as CognitoUser;
    return user;
  }

  public async getAWSTemporaryCred(user: CognitoUser) {
    const cognitoIdentityPool = `cognito-idp.${config.REGION}.amazonaws.com/${config.USER_POOL_ID}`;

    const creds = fromCognitoIdentityPool({
      identityPoolId: config.IDENTITY_POOL_ID,
      logins: {
        [cognitoIdentityPool]: user.getSignInUserSession()!.getIdToken().getJwtToken(),
      },
      clientConfig: { region: config.REGION },
    });
  }
}
