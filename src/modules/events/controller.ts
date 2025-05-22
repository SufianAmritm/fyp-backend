import { Controller, Inject, Post } from '@nestjs/common';
import { IEventsGateway } from './interface/events.interface';

@Controller('est')
export class EventsController {
  constructor(
    @Inject(IEventsGateway) private readonly eventsGateway: IEventsGateway,
  ) {}
  @Post()
  async sendEvent(data: any) {
    return await this.eventsGateway.sendEvent({
      to: '17',
      pub: 'notification',
      data: {},
    });
  }
}
