import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SettingCustomerDecorater = createParamDecorator(
    (data: any, executionContext: ExecutionContext) => {
    const request = executionContext.switchToHttp().getRequest();
    return request.body ? request.body?.[data] : request.body;
},
);
