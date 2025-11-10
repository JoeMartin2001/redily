import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailClientModule } from 'src/infra/email-client/email-client.module';

@Module({
  providers: [EmailService],
  imports: [EmailClientModule],
})
export class EmailModule {}
