import { Module } from '@nestjs/common';
import { EmailClientService } from 'src/infra/email-client/email-client.service';

@Module({
  providers: [EmailClientService],
  exports: [EmailClientService],
})
export class EmailClientModule {}
