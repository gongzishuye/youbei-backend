import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ContentCurdService } from './content.curd';
import { Summary } from './entities/summary.entity';
import { Reference } from './entities/references.entity';
import { ReferenceQuestions } from './entities/reference-questions.entity';
import { CoreArticles } from './entities/core-articles.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dialogs } from './entities/dialogs.entity';
import { DialogsMessage } from './entities/dialogs-messages.entity';  
import { SummaryQuestions } from './entities/summary-questions.entity';
import { AssetsModule } from 'src/assets/assets.module';
import { Articles } from './entities/articles.entity';
import { Course } from './entities/courses.entity';
@Module({ 
  imports: [TypeOrmModule.forFeature([
    Summary, Reference, ReferenceQuestions, CoreArticles, Dialogs, DialogsMessage, SummaryQuestions, Articles, Course
  ]),
  AssetsModule
],
  controllers: [ContentController],
  providers: [ContentService, ContentCurdService],
  exports: [ContentService]
})
export class ContentModule {}
