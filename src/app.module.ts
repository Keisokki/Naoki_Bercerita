import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { MenuModule } from './menu/menu.module';
import { PromoModule } from './promo/promo.module';
import { TransactionModule } from './transaction/transaction.module';
import { TableModule } from './table/table.module';

@Module({
  imports: [PrismaModule, AuthModule, CategoryModule, MenuModule, PromoModule, TransactionModule, TableModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
