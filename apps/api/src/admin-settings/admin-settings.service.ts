import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSettings() {
    const settingsArray = await this.prisma.storeSetting.findMany();
    // Reduce array into key-value map
    return settingsArray.reduce((acc, current) => {
        acc[current.key] = current.value;
        return acc;
    }, {} as Record<string, string>);
  }

  async updateSettings(settingsData: Record<string, string>) {
    // Upsert each key inside a transaction for atomic safety
    const operations = Object.entries(settingsData).map(([key, value]) => {
        return this.prisma.storeSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });
    });

    await this.prisma.$transaction(operations);
    return { success: true };
  }
}
