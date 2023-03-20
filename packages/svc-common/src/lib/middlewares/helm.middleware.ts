import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

const _helmet = helmet();

@Injectable()
export class HelmMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
		_helmet(req, res, next)
  }
}