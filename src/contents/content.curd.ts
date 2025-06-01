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
    return this.referenceRepository.find({ where: { rtype, rtypeId }, take: 3, skip: (page - 1) * 10 });
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

  async createChatHistory(chatHistory: {
    userid: number;
    prompt: string;
    response: string;
    reasoningContent: string;
    references: string[];
  }) {
    const userDialogsMessage = new DialogsMessage();
    userDialogsMessage.userId = chatHistory.userid;
    userDialogsMessage.role = 0;
    userDialogsMessage.content = chatHistory.prompt;
    userDialogsMessage.tokens = chatHistory.prompt.length;

    const systemDialogsMessage = new DialogsMessage();
    systemDialogsMessage.userId = chatHistory.userid;
    systemDialogsMessage.role = 1;
    systemDialogsMessage.content = chatHistory.response;
    systemDialogsMessage.tokens = chatHistory.response.length;
    
    await this.dialogsMessageRepository.save(userDialogsMessage);
    await this.dialogsMessageRepository.save(systemDialogsMessage);
  }

  async findChatHistoryByUserid(userid: number, page: number) {
    return this.dialogsMessageRepository.find({ where: { userId: userid }, take: 4, skip: (page - 1) * 4 });
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
      .take(10)
      .getMany();
  }
  
}