import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './db.config';

type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
};

@Module({
  imports: [
    // Глобальный конфиг
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get<DatabaseConfig>('database');

        if (!db) {
          throw new Error('Database config is missing');
        }

        return {
          type: 'postgres',
          host: db.host,
          port: Number(db.port),
          username: db.user,
          password: db.password,
          database: db.name,

          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
