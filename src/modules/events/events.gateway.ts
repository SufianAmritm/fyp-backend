import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import * as jwt from 'jsonwebtoken';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { JwtPayload } from '../../common/interfaces';
import { CreateEventDto } from './dto';
import { IEventsGateway } from './interface/events.interface';

@ApiTags('Events')
@WebSocketGateway({
  namespace: 'api/events',
  cors: '*',
})
export class EventsGateway
  implements IEventsGateway, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly CONTEXT = 'context';

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const { authorization } = client.handshake.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      client.emit(
        'error',
        'Unauthorized: Missing or invalid Authorization header',
      );
      client.disconnect();
      return;
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      client.emit('error', 'Unauthorized: Invalid token format');
      client.disconnect();
      return;
    }
    try {
      const verified = await this.verifyToken(token);
      if (!verified) {
        client.emit('error', 'Unauthorized: Invalid token');
        client.disconnect();
        return;
      }

      const context: JwtPayload = {
        id: verified.id,
        role: verified.role,
        email: verified.email,
        emailVerified: verified.emailVerified,
        stationId: verified.stationId,
      };

      client.handshake[this.CONTEXT] = context;
      client.join(verified.id.toString());
    } catch (error) {
      client.emit('error', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const { userId } = client.handshake[this.CONTEXT];
    client.leave(userId.toString());
  }

  @ApiOperation({ summary: 'Message recieved from client event' })
  async sendEvent(data: CreateEventDto) {
    try {
      this.server.to(data.to).emit(data.pub, data);
      return RESPONSE_MESSAGES.CREATED;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as JwtPayload);
        }
      });
    });
  }
}
