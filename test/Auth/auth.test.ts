import { config } from './config';
import { AuthService } from './AuthService';

async function callStuff() {
  const authService = new AuthService();

  const user = await authService.login(config.TEST_USER_NAME, config.TEST_USER_PASSWORD);
  console.log(user);
}

callStuff();
