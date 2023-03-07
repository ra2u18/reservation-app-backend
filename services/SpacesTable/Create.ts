import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { spaceSchema } from '../Shared/Model';
import { random, getEventBody, addCorsHeader } from '../Shared/Utils';

const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB({ region: 'eu-west-1' });

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from DynamoDB',
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
      'Access-Control-Allow-Methods': '*',
    },
  };

  // addCorsHeader(result);

  console.log(result);

  const unparsedBody = getEventBody(event);
  unparsedBody.spaceId = random();

  const createSpaceBody = spaceSchema.safeParse(unparsedBody);

  if (!createSpaceBody.success) {
    result.body = JSON.stringify({ message: createSpaceBody.error });
    result.statusCode = 403;

    return result;
  }

  try {
    const command = new PutItemCommand({
      TableName: TABLE_NAME!,
      Item: marshall(createSpaceBody.data),
    });

    await dbClient.send(command);
    result.body = JSON.stringify({
      id: createSpaceBody.data.spaceId
    });
  } catch (err) {
    if (err instanceof Error) {
      result.statusCode = 500;
      result.body = err.message;
    }
  }

  return result;
}

export { handler };
