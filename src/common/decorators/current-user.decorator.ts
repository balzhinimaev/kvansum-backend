import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest, AuthenticatedUser } from '../types/authenticated-user';

type WsClient = {
  handshake?: {
    user?: AuthenticatedUser;
  };
  user?: AuthenticatedUser;
};

const getHttpUser = (context: ExecutionContext): AuthenticatedUser | undefined => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  return request?.user;
};

const getWsUser = (context: ExecutionContext): AuthenticatedUser | undefined => {
  const client: WsClient = context.switchToWs().getClient();
  return client?.handshake?.user ?? client?.user;
};

const getGraphqlUser = (context: ExecutionContext): AuthenticatedUser | undefined => {
  const graphqlContext = context.getArgByIndex?.(2);
  if (!graphqlContext) {
    return undefined;
  }

  const request = graphqlContext.req ?? graphqlContext.request;
  return (request as AuthenticatedRequest | undefined)?.user;
};

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): AuthenticatedUser => {
    const type = context.getType<string>();

    const user =
      type === 'http'
        ? getHttpUser(context)
        : type === 'ws'
          ? getWsUser(context)
          : type === 'graphql'
            ? getGraphqlUser(context)
            : getHttpUser(context);

    if (!user) {
      throw new UnauthorizedException('Current user is not available in the request context');
    }

    return user;
  },
);

