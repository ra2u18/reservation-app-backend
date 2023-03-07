import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { addCorsHeader } from '../Shared/Utils';

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
  
  addCorsHeader(result);

  try {
    if (!event.queryStringParameters) {
      result.body = await scanAllTable();
      return result;
    }

    if (PRIMARY_KEY! in event.queryStringParameters) {
      result.body = await scanWithPrimaryPartition(event.queryStringParameters);
    } else {
      result.body = await scanWithSecondaryPartition(event.queryStringParameters);
    }
  } catch (err: any) {
    result.body = err.message;
  }

  return result;
}

async function scanAllTable() {
  const queryResponse = await dbClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  return JSON.stringify(queryResponse);
}

async function scanWithPrimaryPartition(
  queryParams: APIGatewayProxyEventQueryStringParameters
) {
  const keyValue = queryParams[PRIMARY_KEY!] as string;
  const queryResponse = await dbClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#a = :a',
      ExpressionAttributeNames: { '#a': PRIMARY_KEY! },
      ExpressionAttributeValues: { ':a': { S: keyValue } },
    })
  );

  return JSON.stringify(queryResponse);
}

async function scanWithSecondaryPartition(
  queryParams: APIGatewayProxyEventQueryStringParameters
) {
  const queryKey = Object.keys(queryParams)[0];
  const queryValue = queryParams[queryKey] as string;

  const queryResponse = await dbClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      IndexName: queryKey,
      FilterExpression: '#a = :a',
      ExpressionAttributeNames: { '#a': queryKey },
      ExpressionAttributeValues: { ':a': { S: queryValue } },
    })
  );

  return JSON.stringify(queryResponse);
}

export { handler };
