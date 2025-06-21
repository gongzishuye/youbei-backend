import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { ContentCurdService } from './content.curd';
import { Reference } from './entities/references.entity';
import { ReferenceQuestions } from './entities/reference-questions.entity';
import { SUMMARY_TEMPLATE_WITH_ASSET_NAME, QUESTION_TEMPLATE, STRATEGY_PIE_TEMPLATE } from './content.constants';
import { SummaryQuestions } from './entities/summary-questions.entity';
import { AssetsCurdService } from 'src/assets/assets.curd';
import { CreateCourseDto } from './dto/create-course.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
// Extended types for custom properties
interface ExtendedDelta extends OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta {
  reasoning_content?: string;
}

interface ExtendedChoice extends Omit<OpenAI.Chat.Completions.ChatCompletionChunk.Choice, 'delta'> {
  delta: ExtendedDelta;
}

interface ExtendedChunk extends Omit<OpenAI.Chat.Completions.ChatCompletionChunk, 'choices'> {
  references?: string[];
  choices: ExtendedChoice[];
}

interface ExtraRelInfo {
  rel_info: string;
  freshness_info: string;
  auth_info: string;
}

interface ReferenceOpenAI {
  url: string;
  logo_url: string;
  title: string;
  summary: string;
  publish_time: string;
  cover_image: {
    url: string;
  };
  extra: ExtraRelInfo;
}

interface ExtendedChatCompletion extends OpenAI.Chat.Completions.ChatCompletion {
  references?: ReferenceOpenAI[];
}

interface ExtendedChatCompletionMessage extends OpenAI.Chat.Completions.ChatCompletionMessage {
  reasoning_content?: string;
}

@Injectable()
export class ContentService {

  private openai: OpenAI;

  private model: string;
  private modelEasy: string;
  private logger = new Logger(ContentService.name);

  constructor(
    private configService: ConfigService,
    private contentCurdService: ContentCurdService,
    private assetsCurdService: AssetsCurdService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
      baseURL: this.configService.get('OPENAI_BASE_URL'),
    });
    this.model = 'bot-20250320172734-gcwj7';
    this.modelEasy = 'bot-20250322173127-2kh4l';
  }

  async streaming() {
    // Streaming:
    console.log('----- streaming request -----')
    const stream = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: '你是人工智能助手' },
        { role: 'user', content: '美联储有什么动态' },
      ],
      model: this.model,
      stream: true,
    });

    for await (const part of stream as unknown as AsyncIterable<ExtendedChunk>) {
      // Handle references if they exist
      if (part.references) {
        console.log(part.references);
      }

      // Skip if no choices
      if (!part.choices || part.choices.length === 0) {
        continue;
      }

      // Handle content
      if (part.choices[0]?.delta?.content) {
        process.stdout.write(part.choices[0].delta.content);
      }
      
      // Handle reasoning content if it exists
      if (part.choices[0]?.delta?.reasoning_content) {
        console.log(part.choices[0].delta.reasoning_content);
      }
    }
    process.stdout.write('\n');
  }

  async nonStreamingSingleRound(prompt: string) {
    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: '你是人工智能助手' },
        { role: 'user', content: prompt },
      ],
      model: this.model,
      stream: false
    }) as ExtendedChatCompletion;

    const references = completion.references;
    for(const reference of references) {
      console.log(reference);
    }
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');
    const message = completion.choices[0].message as ExtendedChatCompletionMessage;
    console.log(message);
    const reasoningContent = message.reasoning_content;
    const content = message.content; 
    return {
      reasoningContent,
      content,
      references,
    }
  }

  async triggerContent(userid: number) {
    this.triggerSummary(userid);
    this.triggerStrategyPie(userid);
  }

  async triggerSummary(userid: number) {
    // 获取今天零点的时间
    const startAt = new Date();
    startAt.setHours(0, 0, 0, 0);
    const summaries = await this.contentCurdService
      .findSummaryByUseridAndStartAt(userid, startAt);
    this.logger.log('summaries', summaries);
    if(summaries.length === 0) {
      this.logger.error('没有生成摘要');
      return {
        status: 1,
        message: '没有生成摘要',
      }
    }
    this.logger.log('summaries', summaries);

    const summary = summaries[0];
    if(summary.trigger) {
      this.logger.error('已经触发摘要生成');
      return {
        status: 0,
        message: '已经触发摘要生成',
      }
    }
    if(!summary.assets) {
      this.logger.error('没有找到资产，无法生成摘要');
      return {
        status: 1,
        message: '没有找到资产，无法生成摘要',
      }
    }

    const assetName = summary.assets.name;
    const prompt = SUMMARY_TEMPLATE_WITH_ASSET_NAME(assetName);
    const {
      content,
      references,
    } = await this.nonStreamingSingleRound(prompt);
    this.logger.log('summary references', references);
    this.logger.log('summary content', content);

    //// save references
    references.map(async (reference) => {
      const referenceEntity = new Reference();
      referenceEntity.rtypeId = summary.id;
      referenceEntity.rtype = 0;
      referenceEntity.url = reference.url;
      referenceEntity.logoUrl = reference.logo_url;
      referenceEntity.title = reference.title;
      referenceEntity.summary = reference.summary;
      referenceEntity.publishTime = reference.publish_time;
      referenceEntity.coverImageUrl = reference.cover_image?.url;
      referenceEntity.extraRelInfo = reference.extra?.rel_info;
      referenceEntity.extraFreshnessInfo = reference.extra?.freshness_info;
      referenceEntity.extraAuthInfo = reference.extra?.auth_info;
      await this.contentCurdService.createReferences(referenceEntity);
      return referenceEntity;
    });

    //// 获取前三份数据作为questions
    let questions = [];
    try {
      questions = content.split('[Questions]')[1].split('[tab]').slice(0, 3);
    } catch (error) {
      this.logger.error('questions解析错误', error);
    }
    this.logger.log('questions from answers: ', questions);
    questions.map(async (question) => {
      const questionEntity = new SummaryQuestions();
      questionEntity.summaryId = summary.id;
      questionEntity.question = question.trim();
      await this.contentCurdService.createSummaryQuestions(questionEntity);
      return questionEntity;
    });

    await this.contentCurdService.updateSummaryTrigger(summary.id, true);
  }

  async triggerStrategyPie(userid: number) {
    // 获取今天零点的时间
    const startAt = new Date();
    startAt.setHours(0, 0, 0, 0);
    const pieReferences = await this.contentCurdService
      .findReferencesByRtypeidAndStartAt(1, userid, startAt);
    if(pieReferences.length > 0) {
      this.logger.error('已经触发策略捡馅饼生成');
      return {
        status: 0,
        message: '已经触发策略捡馅饼生成',
      }
    }

    const assets = await this.assetsCurdService.findBuysByUserIdStrategy(userid, 3);
    this.logger.log('assets', assets);
    if(assets.length === 0) {
      this.logger.error('没有找到资产，无法生成策略捡馅饼');
      return {
        status: 1,
        message: '没有找到资产，无法生成策略捡馅饼',
      }
    }
    const assetNames = assets.map((asset) => asset.assets.name);
    const assetNamesUnique = [...new Set(assetNames)];
    const prompt = STRATEGY_PIE_TEMPLATE(assetNamesUnique);

    const {
      references,
    } = await this.nonStreamingSingleRound(prompt);

    //// save references
    references.map(async (reference) => {
      const referenceEntity = new Reference();
      referenceEntity.rtypeId = userid;
      referenceEntity.rtype = 1; // strategy pie
      referenceEntity.url = reference.url;
      referenceEntity.logoUrl = reference.logo_url;
      referenceEntity.title = reference.title;
      referenceEntity.summary = reference.summary;
      referenceEntity.publishTime = reference.publish_time;
      referenceEntity.coverImageUrl = reference.cover_image?.url;
      referenceEntity.extraRelInfo = reference.extra?.rel_info;
      referenceEntity.extraFreshnessInfo = reference.extra?.freshness_info;
      referenceEntity.extraAuthInfo = reference.extra?.auth_info;
      await this.contentCurdService.createReferences(referenceEntity);
      return referenceEntity;
    });
  }
    
  async getSummary(userid: number) {
    const startAt = new Date();
    startAt.setHours(0, 0, 0, 0);
    const summaries = await this.contentCurdService
      .findSummaryByUseridAndStartAt(userid, startAt);
    if(summaries.length === 0) {
      return {
        status: 1,
        message: '没有生成摘要',
      }
    }
    const summary = summaries[0];
    const trigger = summary.trigger;
    if(!trigger) {
      return {
        status: 1,
        message: '没有触发摘要生成',
      }
    }
    this.logger.log('summary', summary);
    const summaryId = summary.id;
    const questions = await this.contentCurdService.findSummaryQuestionsBySummaryId(summaryId);
    const course = {
      title: '跟着Luca一起学',
      url: 'https://mp.weixin.qq.com/s/O_XwHiJ3O_nImmlMCSx1wg',
      summary: '近期你投资了BTC，推荐你学习相关课程《BTC入门指南》',
    }
    
    return {
      status: 0,
      assetName: summary.assets.name,
      summaryId,
      summary: summary.content,
      questions: questions.map((question) => question.question),
      course
    }
  }

  async getQuestions(referenceId: number) {
    const rQuestions = await this.contentCurdService.findReferenceQuestionsByReferenceId(referenceId);
    if(rQuestions.length > 0) {
      return {
        status: 0,
        questions: rQuestions.map((question) => question.question),
      }
    }
    const reference = await this.contentCurdService.findReferenceById(referenceId);
    if(!reference) {
      throw new HttpException('referenceId不存在', HttpStatus.BAD_REQUEST);
    }
    const questions = await this.getQuestionsByContent(reference.summary);
    questions.map(async (question) => {
      const questionEntity = new ReferenceQuestions();
      questionEntity.referenceId = referenceId;
      questionEntity.question = question.trim();
      await this.contentCurdService.createReferenceQuestions(questionEntity);
    });
    return questions;
  }

  async getQuestionsByContent(contents: string) {
    const prompt = QUESTION_TEMPLATE(contents);

    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: '你是人工智能助手' },
        { role: 'user', content: prompt },
      ],
      model: this.modelEasy,
      stream: false
    }) as ExtendedChatCompletion;
    const message = completion.choices[0].message as ExtendedChatCompletionMessage;
    
    const content = message.content; 
    const questions = content.split('[Questions]')[1].split('[tab]').slice(0, 3);
    this.logger.log('questions from answers: ', questions);
    return questions.map((question) => question.trim());
  }


  async chat(userid: number, prompt: string) {
    const stream = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: '你是人工智能助手' },
        { role: 'user', content: prompt },
      ],
      model: this.modelEasy,
      stream: true
    });
    console.log('request ok.');

    // 用于收集完整响应
    let fullContent = '';
    let fullReasoningContent = '';
    let references: string[] = [];
    const contentCurdService = this.contentCurdService;
    const getQuestions = this.getQuestionsByContent.bind(this);

    // 返回一个 ReadableStream
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const part of stream as unknown as AsyncIterable<ExtendedChunk>) {
            // Skip if no choices
            if (!part.choices || part.choices.length === 0) {
              continue;
            }

            // Send content if exists
            if (part.choices[0]?.delta?.content) {
              const content = part.choices[0].delta.content;
              console.log('content', content);
              fullContent += content; // 收集内容
              controller.enqueue(content);
            }

            // Handle references if they exist
            if (part.references) {
              references = references.concat(part.references); // 收集引用
              controller.enqueue(JSON.stringify({ references: part.references }));
            }

            // Handle reasoning content if exists
            if (part.choices[0]?.delta?.reasoning_content) {
              const reasoningContent = part.choices[0].delta.reasoning_content;
              fullReasoningContent += reasoningContent; // 收集推理内容
              controller.enqueue(JSON.stringify({ 
                reasoning_content: reasoningContent 
              }));
            }
          }
          
          // 流结束后，保存对话记录
          try {
            const questions = await getQuestions(fullContent);
            const dialog = await contentCurdService.createDialog(userid, prompt);
            // 把dialogId也放到流里面，方便前端展示
            controller.enqueue(JSON.stringify({ 
              dialogId: dialog.id,
              questions
            }));

            await contentCurdService.createChatHistory({
              dialogId: dialog.id,
              userid,
              prompt,
              response: fullContent,
              reasoningContent: fullReasoningContent,
              references: references
            });
          } catch (saveError) {
            console.error('Failed to save chat history:', saveError);
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

  }

  async getHistory(userid: number, page: number) {
    const history = await this.contentCurdService.findChatHistoryByUserid(userid, page);
    return history;
  }

  async getStrategyQuestions(userid: number, strategy: number) {
    const quesitons = [
      {
        question: '什么是种菜策略',
      },
      {
        question: '什么是种菜策略',
      },
      {
        question: '什么是种菜策略',
      },
    ]
    return quesitons;
  }

  async getReferences(rtype: number, rtypeId: number, page: number) {
    const references = await this.contentCurdService.findReferencesByRtypeid(rtype, rtypeId, page);
    return references;
  }

  async getArticles(assetName: string, page: number) {
    const articles = await this.contentCurdService.findRandomArticlesByAssetName();
    this.logger.log('articles', articles);
    return articles;
  }

  async writeCourses(userid: number, createCourseDto: CreateCourseDto) {
    const course = await this.contentCurdService.createCourse(createCourseDto);
    return course;
  }

  async getCourses(page: number) {
    const courses = await this.contentCurdService.findCoursesByPage(page);
    return courses;
  }

  async collectChat(userid: number, dialogId: number, isCollect: boolean) {
    const dialog = await this.contentCurdService.findDialogById(dialogId);
    if(!dialog) {
      throw new HttpException('对话不存在', HttpStatus.BAD_REQUEST);
    }
    // Convert both to number to ensure type consistency
    const dialogUserId = Number(dialog.userId);
    this.logger.log('dialog userId', dialogUserId, typeof dialogUserId);
    this.logger.log('userid', userid, typeof userid);
    if(dialogUserId !== userid) {
      throw new HttpException('无权限收藏', HttpStatus.BAD_REQUEST);
    }
    if(isCollect) {
      dialog.isCollect = 1;
      dialog.collectTime = new Date();
    } else {
      dialog.isCollect = 0;
      dialog.collectTime = null;
    }
    await this.contentCurdService.updateDialog(dialog);
    return {
      dialogId
    }
  }

  async getCollectChat(userid: number, page: number) {
    const dialogs = await this.contentCurdService.findChatCollectByUserid(userid, page);
    return dialogs;
  }
}