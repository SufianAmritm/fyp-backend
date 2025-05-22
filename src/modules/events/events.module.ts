import { Module } from '@nestjs/common';
import { EventsController } from './controller';
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
  controllers: [EventsController],
  providers: [...eventsGatewayProvider],
  exports: [...eventsGatewayProvider],
})
export class EventsModule {}
