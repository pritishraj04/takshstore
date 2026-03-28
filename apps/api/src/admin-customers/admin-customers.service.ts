import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserAccountStatus } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class AdminCustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers(searchQuery: string = '') {
    const whereClause: any = searchQuery
      ? {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { phone: { contains: searchQuery, mode: 'insensitive' } },
          ],
        }
      : {};

    const users = await this.prisma.user.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          where: { status: 'PAID' },
          select: { totalAmount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => {
      const lifetimeValue = u.orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );
      // Exclude raw orders array and password from the response
      const { password, orders, ...safeUser } = u;
      return {
        ...safeUser,
        lifetimeValue,
        totalOrders: u._count.orders,
      };
    });
  }

  async getCustomerById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: true,
                digitalInvite: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Customer profile null');

    const paidOrders = user.orders.filter((o) => o.status === 'PAID');
    const lifetimeValue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const { password, ...safeUser } = user;
    return { ...safeUser, lifetimeValue };
  }

  async updateCustomerStatus(id: string, status: UserAccountStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });
  }

  async createCustomer(dto: CreateCustomerDto) {
    // 1. Check if a customer with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('A customer with this email already exists.');
    }

    // 2. Create the user
    // Generate a placeholder password to satisfy Prisma schema (since User.password is required)
    // The user can reset it via "Forgot Password" later
    const crypto = require('crypto');
    const placeholderPassword = crypto.randomBytes(16).toString('hex');
    const hashed = require('bcrypt').hashSync(placeholderPassword, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashed,
      },
    });
  }
}
