import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 💡 Membuat PrismaService bisa langsung dipakai di modul mana saja
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}