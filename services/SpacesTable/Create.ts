import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { DynamoDB, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { v4 } from 'uuid';

const dbClient = new DynamoDB({ region: 'eu-west-1' });

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from DynamoDB',
  };

  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  item.spaceId = v4();

  try {
    const command = new PutItemCommand({
      TableName: 'SpacesTable',
      Item: marshall(item),
    });

    await dbClient.send(command);
  } catch (err) {
    if (err instanceof Error) {
      result.body = err.message;
    }
  }

  result.body = `Created item with id: ${item.spaceId}`;
  return result;
}

export { handler };
