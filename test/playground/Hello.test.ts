import { handler } from '../../services/SpacesTable/Create';

const event = {
  body: {
    location: 'paris',
  },
};

handler(event as any, {} as any);
