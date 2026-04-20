import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { OuraModule } from './oura/oura.module';
import { BannerModule } from './banner/banner.module';
import { TwitterModule } from './twitter/twitter.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OuraModule,
    BannerModule,
    TwitterModule,
  ],
  providers: [AppService],
})
export class AppModule {}
