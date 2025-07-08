import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { Summary } from './entities/summary.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan } from 'typeorm';
import { Reference } from './entities/references.entity';
import { ReferenceQuestions } from './entities/reference-questions.entity';
import { Dialogs } from './entities/dialogs.entity';
import { DialogsMessage } from './entities/dialogs-messages.entity';
import { SummaryQuestions } from './entities/summary-questions.entity';
import { Articles } from './entities/articles.entity';
import { Course } from './entities/courses.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { v4 as uuidv4 } from 'uuid';
@Injectable()   
export class ContentCurdService {

  constructor(
    @InjectRepository(Summary) private summaryRepository: Repository<Summary>,
    @InjectRepository(Reference) private referenceRepository: Repository<Reference>,
    @InjectRepository(ReferenceQuestions) private referenceQuestionsRepository: Repository<ReferenceQuestions>,
    @InjectRepository(SummaryQuestions) private summaryQuestionsRepository: Repository<SummaryQuestions>,
    @InjectRepository(Dialogs) private dialogsRepository: Repository<Dialogs>,
    @InjectRepository(DialogsMessage) private dialogsMessageRepository: Repository<DialogsMessage>,
    @InjectRepository(Articles) private articlesRepository: Repository<Articles>,
    @InjectRepository(Course) private courseRepository: Repository<Course>,
  ) {}

  async createSummary(summary: Summary) {
    return this.summaryRepository.save(summary);
  }

  async updateSummaryTrigger(summaryId: number, trigger: boolean) {
    const summary = await this.summaryRepository.findOne({ where: { id: summaryId } });
    summary.trigger = trigger;
    return this.summaryRepository.save(summary);
  }

  async findSummaryByUserIdDateTime(userid: number, dateTime: Date) {
    return this.summaryRepository.findOne({ where: { userid, dateTime } });
  }

  async findSummaryByUseridAndStartAt(userid: number, startAt: Date) {
    // createAt 大于 startAt 的记录
    return this.summaryRepository.find({ 
      where: { userid, createdAt: MoreThan(startAt) },
      relations: ['assets']
    });
  }

  async findReferencesByRtypeidAndStartAt(rtype: number, rtypeId: number, startAt: Date) {
    return this.referenceRepository.find({ where: { rtype, rtypeId, createdAt: MoreThan(startAt) } });
  }

  async createReferences(referenceEntity: Reference) {
    return this.referenceRepository.save(referenceEntity);
  }

  async createReferenceQuestions(referenceQuestionsEntity: ReferenceQuestions) {
    return this.referenceQuestionsRepository.save(referenceQuestionsEntity);
  }

  async findReferencesByRtypeid(rtype: number, rtypeId: number, page: number) {
    return this.referenceRepository.find({ where: { rtype, rtypeId }, take: 3, skip: (page - 1) * 3 });
  }

  async findQuestionsByReferenceId(referenceId: number) {
    return this.referenceQuestionsRepository.find({ where: { referenceId } });
  }
  
  async createDialogs(dialogs: Dialogs) {
    return this.dialogsRepository.save(dialogs);
  }

  async createDialogsMessage(dialogsMessage: DialogsMessage) {
    return this.dialogsMessageRepository.save(dialogsMessage);
  }

  async createDialog(userId: number, title: string) {
    const dialog = new Dialogs();
    dialog.userId = userId;
    dialog.title = title;
    return this.dialogsRepository.save(dialog);
  }

  async createChatHistory(chatHistory: {
    dialogId: number;
    userid: number;
    prompt: string;
    response: string;
    reasoningContent: string;
    references: string[];
  }) {
    
    const userDialogsMessage = new DialogsMessage();
    userDialogsMessage.dialogId = chatHistory.dialogId;
    userDialogsMessage.userId = chatHistory.userid;
    userDialogsMessage.role = 0;
    userDialogsMessage.content = chatHistory.prompt;
    userDialogsMessage.tokens = chatHistory.prompt.length;

    const systemDialogsMessage = new DialogsMessage();
    systemDialogsMessage.dialogId = chatHistory.dialogId;
    systemDialogsMessage.userId = chatHistory.userid;
    systemDialogsMessage.role = 1;
    systemDialogsMessage.content = chatHistory.response;
    systemDialogsMessage.tokens = chatHistory.response.length;
    
    await this.dialogsMessageRepository.save(userDialogsMessage);
    await this.dialogsMessageRepository.save(systemDialogsMessage);
  }

  async findChatHistoryByUserid(userid: number, page: number) {
    const size = 8;
    const query = this.dialogsRepository
      .createQueryBuilder('dialog')
      .leftJoinAndSelect('dialog.messages', 'messages')
      .where('dialog.userId = :userid', { userid })
      .orderBy('dialog.collectTime', 'DESC')
      .take(size)
      .skip((page - 1) * size);

    // 打印生成的SQL语句
    console.log('userid', userid);
    console.log('Generated SQL:', query.getSql());
    
    return query.getMany();
  }

  async findReferenceQuestionsByReferenceId(referenceId: number) {
    return this.referenceQuestionsRepository.find({ where: { referenceId } });
  }

  async createSummaryQuestions(summaryQuestionsEntity: SummaryQuestions) {
    return this.summaryQuestionsRepository.save(summaryQuestionsEntity);
  }

  async findSummaryQuestionsBySummaryId(summaryId: number) {
    return this.summaryQuestionsRepository.find({ where: { summaryId } });
  }

  async findRandomArticlesByAssetName() {
    return this.articlesRepository
      .createQueryBuilder('articles')
      .orderBy('RAND()')
      .take(3)
      .getMany();
  }

  async createCourse(createCourseDto: CreateCourseDto) {
    const course = this.courseRepository.create(createCourseDto);
    return this.courseRepository.save(course);
  }
  
  async findCoursesByPage(page: number) {
    return this.courseRepository.find({ take: 10, skip: (page - 1) * 10 });
  }
  
  async findDialogById(dialogId: number) {
    return this.dialogsRepository.findOne({ where: { id: dialogId } });
  }

  async updateDialog(dialog: Dialogs) {
    return this.dialogsRepository.save(dialog);
  }

// ... existing code ...
async findChatCollectByUserid(userid: number, page: number) {
  const query = this.dialogsRepository
    .createQueryBuilder('dialog')
    .leftJoinAndSelect('dialog.messages', 'messages')
    .where('dialog.userId = :userid', { userid })
    .andWhere('dialog.isCollect = :isCollect', { isCollect: 1 })
    .orderBy('dialog.collectTime', 'DESC')
    .take(10)
    .skip((page - 1) * 10);

  // 打印生成的SQL语句
  console.log('userid', userid);
  console.log('Generated SQL:', query.getSql());
  
  return query.getMany();
}
// ... existing code ...

  async findReferenceById(referenceId: number) {
    return this.referenceRepository.findOne({ where: { id: referenceId } });
  }
}