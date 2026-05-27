import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  // 🛒 1. FITUR CHECKOUT (BUAT TRANSAKSI BARU + AUTO KUNCI MEJA + AUTO POTONG STOK)
  async create(body: {
    customerName: string;
    orderType: 'DINE_IN' | 'TAKEAWAY';
    tableId?: number;
    userId?: number;
    promoCode?: string;
    items: { menuId: number; quantity: number }[];
  }) {
    const { customerName, orderType, tableId, userId, promoCode, items } = body;

    if (!items || items.length === 0) {
      throw new BadRequestException('Keranjang belanja tidak boleh kosong!');
    }

    return this.prisma.$transaction(async (tx) => {
      
      // 💡 VALIDASI & KUNCI MEJA OTOMATIS
      if (orderType === 'DINE_IN' && tableId) {
        const table = await tx.table.findUnique({ where: { id: tableId } });
        if (!table) throw new NotFoundException('Meja tidak ditemukan!');
        
        if (table.status === 'OCCUPIED') {
          throw new BadRequestException(`Meja nomor ${table.number} sedang digunakan/terisi!`);
        }

        await tx.table.update({
          where: { id: tableId },
          data: { status: 'OCCUPIED' },
        });
      }

      let totalGross = 0;
      const itemsToCreate: { menuId: number; quantity: number; price: number }[] = [];

      // Perulangan item belanjaan
      for (const item of items) {
        const menu = await tx.menu.findUnique({ where: { id: item.menuId } });
        if (!menu) throw new NotFoundException(`Menu dengan ID ${item.menuId} tidak ditemukan!`);
        if (!menu.isAvailable) throw new BadRequestException(`Menu ${menu.name} sedang habis!`);
        
        // 📦 VALIDASI STOK: Jika stok di dapur kurang, batalkan otomatis!
        if (menu.stock < item.quantity) {
          throw new BadRequestException(`Stok menu ${menu.name} tidak mencukupi! Tersisa: ${menu.stock} porsi.`);
        }

        // 📦 POTONG STOK OTOMATIS: Kurangi jumlah stok di database secara real-time
        await tx.menu.update({
          where: { id: menu.id },
          data: { stock: menu.stock - item.quantity },
        });

        const itemSubtotal = menu.price * item.quantity;
        totalGross += itemSubtotal;

        itemsToCreate.push({
          menuId: menu.id,
          quantity: item.quantity,
          price: menu.price, 
        });
      }

      let discountAmount = 0;
      let validPromoId: number | null = null;

      if (promoCode) {
        const promo = await tx.promo.findUnique({ where: { code: promoCode.toUpperCase() } });
        if (!promo) throw new NotFoundException('Kode voucher tidak valid!');
        if (!promo.isActive) throw new BadRequestException('Voucher sudah tidak aktif!');
        if (new Date() > new Date(promo.expiresAt)) throw new BadRequestException('Voucher sudah kedaluwarsa!');

        if (promo.isPercent) {
          discountAmount = (totalGross * promo.discount) / 100;
        } else {
          discountAmount = promo.discount;
        }
        validPromoId = promo.id;
      }

      const totalNet = Math.max(0, totalGross - discountAmount);

      const transaction = await tx.transaction.create({
        data: {
          customerName,
          orderType: orderType || 'DINE_IN',
          tableId: tableId || null,
          userId: userId || null,
          promoId: validPromoId,
          status: 'PENDING',
          isPaid: false,
          transactionItems: {
            create: itemsToCreate,
          },
        },
        include: {
          transactionItems: {
            include: { menu: true },
          },
          promo: true,
        },
      });

      return {
        message: `Transaksi berhasil dibuat! Meja dikunci dan stok otomatis berkurang.`,
        transactionId: transaction.id,
        customerName: transaction.customerName,
        orderType: transaction.orderType,
        status: transaction.status,
        kalkulasi_pembayaran: {
          total_kotor: totalGross,
          potongan_diskon: discountAmount,
          total_yang_harus_dibayar: totalNet,
        },
        detail_pesanan: transaction.transactionItems.map((item) => ({
          nama_menu: item.menu.name,
          harga_satuan: item.price,
          jumlah: item.quantity,
          subtotal: item.price * item.quantity,
        })),
      };
    });
  }

  // 💵 2. FITUR PELUNASAN PEMBAYARAN KASIR LOKAL (TUNAI / QRIS)
  async payTransaction(id: number, body: { cashReceived: number; paymentMethod: 'TUNAI' | 'QRIS' }) {
    const { cashReceived, paymentMethod } = body;

    if (paymentMethod !== 'TUNAI' && paymentMethod !== 'QRIS') {
      throw new BadRequestException('Metode pembayaran tidak sah! Hanya menerima TUNAI atau QRIS.');
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { transactionItems: true },
    });

    if (!transaction) throw new NotFoundException('Transaksi tidak ditemukan!');
    if (transaction.isPaid) throw new BadRequestException('Transaksi ini sudah lunas dibayar!');

    let totalGross = 0;
    for (const item of transaction.transactionItems) {
      totalGross += item.price * item.quantity;
    }

    let discountAmount = 0;
    if (transaction.promoId) {
      const promo = await this.prisma.promo.findUnique({ where: { id: transaction.promoId } });
      if (promo) {
        discountAmount = promo.isPercent ? (totalGross * promo.discount) / 100 : promo.discount;
      }
    }

    const totalToPay = Math.max(0, totalGross - discountAmount);

    let change = 0;
    if (paymentMethod === 'TUNAI') {
      if (cashReceived < totalToPay) {
        throw new BadRequestException(`Uang tunai kurang! Tagihan: Rp ${totalToPay}. Uang diterima: Rp ${cashReceived}.`);
      }
      change = cashReceived - totalToPay;
    } else if (paymentMethod === 'QRIS') {
      if (cashReceived !== totalToPay) {
        throw new BadRequestException(`Untuk pembayaran QRIS, nominal uang harus pas senilai Rp ${totalToPay}!`);
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id },
        data: {
          status: 'SERVED', 
          isPaid: true,
        },
      });

      if (transaction.tableId) {
        await tx.table.update({
          where: { id: transaction.tableId },
          data: { status: 'AVAILABLE' },
        });
      }
    });

    return {
      message: `Pembayaran via ${paymentMethod} Berhasil! Struk lunas dicetak.`,
      nota_pembayaran: {
        transactionId: transaction.id,
        metode_pembayaran: paymentMethod,
        total_tagihan: totalToPay,
        uang_diterima: cashReceived,
        uang_kembalian: change,
      },
    };
  }

  // ❌ 3. FITUR PEMBATALAN TRANSAKSI (CANCEL ORDER + AUTO BEBASKAN MEJA)
  async cancelTransaction(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan!');
    }
    if (transaction.status === 'BATAL') {
      throw new BadRequestException('Transaksi ini memang sudah dibatalkan sebelumnya!');
    }
    if (transaction.isPaid) {
      throw new BadRequestException('Transaksi tidak bisa dibatalkan karena sudah lunas dibayar!');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id },
        data: { status: 'BATAL' },
      });

      if (transaction.tableId) {
        await tx.table.update({
          where: { id: transaction.tableId },
          data: { status: 'AVAILABLE' },
        });
      }
    });

    return {
      message: `Transaksi ID #${id} atas nama ${transaction.customerName} berhasil dibatalkan. Meja makan telah dikosongkan kembali.`,
    };
  }

  // 📊 4. FITUR LAPORAN PENJUALAN DINAMIS (BISA FILTER PERIODE)
  async getSalesReport(startDate?: string, endDate?: string) {
    const dateFilter: any = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        dateFilter.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const allTransactions = await this.prisma.transaction.findMany({
      where: dateFilter,
      include: {
        transactionItems: {
          include: { menu: true }
        }
      }
    });

    let totalGrossRevenue = 0;
    let totalDiscount = 0;
    let totalNetRevenue = 0;
    let totalPaidOrders = 0;
    let totalCanceledOrders = 0;
    let totalPendingOrders = 0;
    let totalDineIn = 0;
    let totalTakeaway = 0;

    const menuSalesTracker: Record<string, { quantity: number; revenue: number }> = {};

    for (const trx of allTransactions) {
      if (trx.orderType === 'DINE_IN') totalDineIn++;
      if (trx.orderType === 'TAKEAWAY') totalTakeaway++;

      if (trx.status === 'BATAL') {
        totalCanceledOrders++;
        continue;
      }
      if (!trx.isPaid) {
        totalPendingOrders++;
        continue;
      }

      totalPaidOrders++;

      let trxGross = 0;
      for (const item of trx.transactionItems) {
        const itemSubtotal = item.price * item.quantity;
        trxGross += itemSubtotal;

        if (!menuSalesTracker[item.menu.name]) {
          menuSalesTracker[item.menu.name] = { quantity: 0, revenue: 0 };
        }
        menuSalesTracker[item.menu.name].quantity += item.quantity;
        menuSalesTracker[item.menu.name].revenue += itemSubtotal;
      }

      let trxDiscount = 0;
      if (trx.promoId) {
        const promo = await this.prisma.promo.findUnique({ where: { id: trx.promoId } });
        if (promo) {
          trxDiscount = promo.isPercent ? (trxGross * promo.discount) / 100 : promo.discount;
        }
      }

      const trxNet = Math.max(0, trxGross - trxDiscount);

      totalGrossRevenue += trxGross;
      totalDiscount += trxDiscount;
      totalNetRevenue += trxNet;
    }

    const bestSellingMenus = Object.entries(menuSalesTracker)
      .map(([name, data]) => ({
        nama_menu: name,
        porsi_terjual: data.quantity,
        total_pendapatan: data.revenue,
      }))
      .sort((a, b) => b.porsi_terjual - a.porsi_terjual);

    return {
      message: 'Laporan penjualan sukses dihitung otomatis.',
      periode_laporan: startDate && endDate 
        ? `${startDate} sampai ${endDate}` 
        : 'Semua Periode (Total Keseluruhan)',
      ringkasan_keuangan: {
        total_omzet_kotor: totalGrossRevenue,
        total_potongan_diskon: totalDiscount,
        total_omzet_resmi_bersih: totalNetRevenue,
      },
      statistik_pesanan: {
        total_nota_masuk: allTransactions.length,
        nota_lunas: totalPaidOrders,
        nota_pending: totalPendingOrders,
        nota_batal: totalCanceledOrders,
        pilihan_dine_in: totalDineIn,
        pilihan_takeaway: totalTakeaway,
      },
      menu_terlaris_peringkat: bestSellingMenus,
    };
  }

  // 📋 5. LIHAT RIWAYAT SELURUH TRANSAKSI
  async findAll() {
    return this.prisma.transaction.findMany({
      include: {
        transactionItems: { include: { menu: true } },
        promo: true,
      },
      orderBy: { id: 'desc' },
    });
  }
}