import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
//import { RequestIdMiddleware } from 'src/shared/middlewares/request-id/request-id.middleware';

export function middlewareSetup(app: NestExpressApplication) {
  //app.use(RequestIdMiddleware);
}
