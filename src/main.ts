import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// 💡 1. Import library Swagger-nya di sini
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔓 KONFIGURASI CORS AMAN: Mengunci akses hanya untuk frontend localhost:3000
  app.enableCors({
    origin: 'http://localhost:3000', // Hanya alamat ini yang diizinkan mengakses backend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Metode HTTP yang diperbolehkan
    credentials: true, // Izinkan jika frontend mengirimkan cookie/header otentikasi
  });

  // 💡 2. Nyalakan dan Atur Konfigurasi Swagger
  const config = new DocumentBuilder()
    .setTitle('Naoki Bercerita - API Kasir Restoran 🍜')
    .setDescription('Dokumentasi backend POS Restoran lengkap dengan fitur Auto-Stok, Meja, dan Guards Akses.')
    .setVersion('1.0')
    .addBearerAuth() // 🔒 PENTING: Baris ini wajib ada agar tombol "Authorize" (Gembok) di halaman Swagger aktif!
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Rute URL untuk mengakses Swagger UI (http://localhost:3000/api)
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000; // 💡 Membaca port dinamis dari server
  await app.listen(port);
  console.log(`🚀 Aplikasi berjalan di port: ${port}`);
  console.log(`📖 Swagger aktif di: http://localhost:${port}/api`);
}
bootstrap();