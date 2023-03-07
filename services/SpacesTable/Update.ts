import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import { getEventBody, addCorsHeader } from '../Shared/Utils';

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
  addCorsHeader(result);

  const requestBody = getEventBody(event);
  const spaceId = event.queryStringParameters?.[PRIMARY_KEY] as string;

  if (!(requestBody && spaceId)) {
    result.body = 'No request body or space id found';
    result.statusCode = 404;
    return result;
  }

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

  try {
    const updatedItem = await dbClient.send(new UpdateItemCommand(params));

    result.body = JSON.stringify(updatedItem);
  } catch (err: any) {
    result.body = err.message;
  }

  return result;
}

export { handler };
