import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [/localhost:\d+$/, /127\.0\.0\.1:\d+$/],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');
  private connectedClients = new Map<string, Socket>();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
    
    // Отправляем приветственное сообщение
    client.emit('welcome', {
      message: 'Connected to Kvansum API',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { message: string },
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`Message from ${client.id}: ${data.message}`);
    // Отправляем ответ клиенту
    client.emit('message', {
      sender: 'server',
      message: `Echo: ${data.message}`,
      timestamp: new Date().toISOString(),
    });
  }

  // Метод для отправки уведомлений всем подключенным клиентам
  broadcastNotification(event: string, data: any): void {
    this.server.emit(event, data);
  }

  // Метод для отправки уведомления конкретному клиенту
  sendToClient(clientId: string, event: string, data: any): void {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit(event, data);
    }
  }

  // Получить количество подключенных клиентов
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

