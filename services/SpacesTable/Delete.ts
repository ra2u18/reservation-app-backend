import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { DeleteItemCommand, DynamoDB } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME as string;
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;

const dbClient = new DynamoDB({ region: 'eu-west-1' });

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from DynamoDB',
  };

  const spaceId = event.queryStringParameters?.[PRIMARY_KEY] as string;

  if (!spaceId) {
    result.body = 'No id found';
    result.statusCode = 404;
    return result;
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { [PRIMARY_KEY]: { S: spaceId } },
  };

  try {
    const deleteItem = await dbClient.send(new DeleteItemCommand(params));

    result.body = JSON.stringify(deleteItem);
  } catch (err: any) {
    result.body = err.message;
  }

  return result;
}

export { handler };
