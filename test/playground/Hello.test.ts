import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../services/SpacesTable/Read';

const event: APIGatewayProxyEvent = {
  queryStringParameters: {
    spaceId: '590bd5d0-2be9-4966-a7d3-3b24f9f810e0',
  },
} as any;

const result = handler(event, {} as any).then((val) => {
  const items = JSON.parse(val.body);
  console.log(123);
});
