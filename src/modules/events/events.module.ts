import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { IEventsGateway } from './interface/events.interface';

const eventsGatewayProvider = [
  {
    provide: IEventsGateway,
    useClass: EventsGateway,
  },
];
@Module({
  imports: [],
  providers: [...eventsGatewayProvider],
  exports: [...eventsGatewayProvider],
})
export class EventsModule {}
