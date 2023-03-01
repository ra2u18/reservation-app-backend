import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../services/SpacesTable/Update';

const event: APIGatewayProxyEvent = {
  queryStringParameters: {
    spaceId: '590bd5d0-2be9-4966-a7d3-3b24f9f810e0',
  },
  body: {
    location: 'new location',
  },
} as any;

(async () => {
  const result = await handler(event as any, {} as any);

  console.log(result);
  console.log('here');
})();
