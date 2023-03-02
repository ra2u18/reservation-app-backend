import { APIGatewayProxyEvent } from 'aws-lambda';

(Math.random() + 1).toString(36).substring(7);
export const random = () => (Math.random() + 1).toString(36).slice(2, 7);

export const getEventBody = (event: APIGatewayProxyEvent) =>
  typeof event.body == 'object' ? event.body : JSON.parse(event.body);
