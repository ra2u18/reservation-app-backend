import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { DynamoDB, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

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

  const requestBody = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  const spaceId = event.queryStringParameters?.[PRIMARY_KEY] as string;

  if (requestBody && spaceId) {
    const requestBodyKey = Object.keys(requestBody)[0];
    const requestBodyValue = { S: requestBody[requestBodyKey] };

    const params = {
      TableName: TABLE_NAME,
      Key: { [PRIMARY_KEY]: { S: spaceId } },
      UpdateExpression: 'set #zzzNew = :new',
      ExpressionAttributeValues: { ':new': requestBodyValue },
      ExpressionAttributeNames: { '#zzzNew': requestBodyKey },
      ReturnValues: 'UPDATED_NEW',
    };

    console.log(params);

    try {
      await dbClient.send(
        new UpdateItemCommand({
          TableName: TABLE_NAME,
          Key: { [PRIMARY_KEY]: { S: spaceId } },
          UpdateExpression: 'set #zzzNew = :new',
          ExpressionAttributeValues: { ':new': requestBodyValue },
          ExpressionAttributeNames: { '#zzzNew': requestBodyKey },
          ReturnValues: 'UPDATED_NEW',
        })
      );
      console.log(requestBodyKey);
      console.log(requestBodyValue);
    } catch (err: any) {
      console.log(err);
      result.body = err.message;
    }
  }

  return result;
}

export { handler };
