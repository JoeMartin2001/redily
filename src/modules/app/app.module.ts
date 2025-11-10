import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/infra/config/config.module';
import { DatabaseModule } from 'src/infra/database/database.module';
import { GqlModule } from 'src/infra/graphql/graphql.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { I18nModule } from 'src/infra/i18n/i18n.module';
import { AppController } from './app.controller';
import { StorageModule } from 'src/infra/storage/storage.module';
import { HealthModule } from 'src/infra/health/health.module';
import { MetricsModule } from 'src/infra/metrics/metrics.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { RidesModule } from '../rides/rides.module';
import { RideRequestsModule } from '../ride-requests/ride-requests.module';
import { BookingsModule } from '../bookings/bookings.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  controllers: [AppController],
  providers: [],

  imports: [
    ConfigModule,
    DatabaseModule,
    GqlModule,
    I18nModule,
    HealthModule,
    MetricsModule,
    StorageModule.forRoot(),

    UserModule,
    AuthModule,

    VehiclesModule,
    RidesModule,
    RideRequestsModule,
    BookingsModule,
    NotificationsModule,
    ChatModule,
  ],
})
export class AppModule {}
