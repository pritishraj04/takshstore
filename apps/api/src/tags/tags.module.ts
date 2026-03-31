import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { PublicTagsController } from './public-tags.controller';

@Module({
    imports: [PrismaModule, AdminAuthModule],
    providers: [TagsService],
    controllers: [TagsController, PublicTagsController],
    exports: [TagsService]
})
export class TagsModule { }
