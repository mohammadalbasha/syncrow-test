
export const WS_ROOMS = {
    DEVICES: 'devices',
    USER: (userId: number) => `user:${userId}`,
  } as const;

  export const WS_EVENTS = {
    MESSAGE: 'message',
    PING: 'ping',
    PONG: 'pong',
    DEVICE_UPDATED: 'device_updated',
    DEVICE_CREATED: 'device_created',
    DEVICE_DELETED: 'device_deleted',
  } as const;
  