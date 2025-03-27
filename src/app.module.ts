import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { AuthModule } from './auth/auth.module';
import { ExerciseModule } from './exercise/exercise.module';
import { Exercise } from './exercise/exercise.entity';
import { Favorite } from './exercise/favorite.entity';
import { Save } from './exercise/save.entity';
import { Rating } from './exercise/rating.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Password123',
      database: 'prehabguys_test',
      entities: [User, Exercise, Favorite, Save, Rating],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Exercise, Favorite, Save, Rating]),
    UserModule,
    AuthModule,
    ExerciseModule,
  ],
})
export class AppModule {}
