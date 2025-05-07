import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { isNumberString } from 'class-validator';

export const NumberID = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const response = ctx.switchToHttp().getResponse();

    const id = request.params[data];

    return id && isNumberString(id)
      ? parseInt(id, 10)
      : response.status(400).json({ msg: 'Invalid Id in parameter' });
  },
);
