import { CreateEventDto } from '../dto';

export const IEventsGateway = Symbol('IEventsGateway');
export interface IEventsGateway {
  sendEvent(data: CreateEventDto): Promise<string>;
}
