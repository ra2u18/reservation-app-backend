import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../services/SpacesTable/Create';

// const updateEvent: APIGatewayProxyEvent = {
//   queryStringParameters: {
//     spaceId: '590bd5d0-2be9-4966-a7d3-3b24f9f810e0',
//   },
//   body: {
//     location: 'new location',
//   },
// } as any;

// const deleteEvent: APIGatewayProxyEvent = {
//   queryStringParameters: {
//     spaceId: '701ef34a-f906-443f-b72d-99c743dd1ad9',
//   },
// } as any;

const createEvent: APIGatewayProxyEvent = {
  body: {
    name: 'some name',
    location: 'some location',
  },
} as any;

(async () => {
  const result = await handler(createEvent as any, {} as any);

  console.log(result);
  console.log('here');
})();
