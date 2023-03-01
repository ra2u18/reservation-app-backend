import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { DynamoDB, ScanCommand, ScanCommandOutput } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;
const dbClient = new DynamoDB({ region: 'eu-west-1' });

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from DynamoDB',
  };

  let queryResponse: ScanCommandOutput;

  try {
    if (!event.queryStringParameters) {
      queryResponse = await dbClient.send(new ScanCommand({ TableName: TABLE_NAME }));
      result.body = JSON.stringify(queryResponse);
      return result;
    }

    if (PRIMARY_KEY! in event.queryStringParameters) {
      const keyValue = event.queryStringParameters[PRIMARY_KEY!] as string;
      queryResponse = await dbClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: '#a = :a',
          ExpressionAttributeNames: { '#a': PRIMARY_KEY! },
          ExpressionAttributeValues: { ':a': { S: keyValue } },
        })
      );

      result.body = JSON.stringify(queryResponse);
    }
  } catch (err: any) {
    result.body = err.message;
  }

  return result;
}

export { handler };
