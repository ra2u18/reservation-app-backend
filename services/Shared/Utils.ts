import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

(Math.random() + 1).toString(36).substring(7);
export const random = () => (Math.random() + 1).toString(36).slice(2, 7);

export const getEventBody = (event: APIGatewayProxyEvent) =>
  typeof event.body == 'object' ? event.body : JSON.parse(event.body);

export const addCorsHeader = (result: APIGatewayProxyResult) => {
  result.headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // we don t know it yet
    'Access-Control-Allow-Methods': '*'    
  };
}