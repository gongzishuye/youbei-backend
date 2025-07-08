import { Controller, Get, Post, Body, Logger, Param, Delete, Request, Query, HttpException, HttpStatus, Res } from '@nestjs/common';
import { ContentService } from './content.service';
import { Response } from 'express';
import { Public } from 'src/auth/constants';
import { CreateCourseDto } from './dto/create-course.dto';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Controller('contents')
export class ContentController {

  private logger = new Logger(ContentController.name);

  constructor(private readonly contentService: ContentService,
  ) {}

  @Get('streaming')
  create() {
    return this.contentService.streaming();
  }

  @Post('trigger')
  triggerSummary(@Request() req: any) {
    const userid = req.user.userid;
    this.logger.log('triggerSummary', userid);
    return this.contentService.triggerContent(Number(userid));
  }

  @Get('summary')
  getSummary(@Request() req: any) {
    const userid = req.user.userid;
    return this.contentService.getSummary(Number(userid));
  }

  @Get('reference/questions')
  getQuestions(@Query('referenceId') referenceId: string) {
    this.logger.log('getQuestions', referenceId);
    if(!referenceId) {
      throw new HttpException('referenceId and summary are required', HttpStatus.BAD_REQUEST);
    }
    return this.contentService.getQuestions(Number(referenceId));
  }

  @Get('chat')
  async chatGet(
    @Request() req: any,
    @Query('message') message: string,
    @Res() response: Response
  ) {
    const userid = req.user.userid;
    return this.handleChatResponse(userid, message, response);
  }

  @Post('chat')
  async chatPost(
    @Request() req: any,
    @Body('message') message: string,
    @Res() response: Response
  ) {
    const userid = req.user.userid;
    return this.handleChatResponse(userid, message, response);
  }

  private async handleChatResponse(userid: number, message: string, response: Response) {

    if (!message) {
      console.log('No message provided');
      response.status(400).json({ error: 'Message is required' });
      return;
    }

    try {
      response.setHeader('Content-Type', 'text/event-stream');
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Connection', 'keep-alive');
      response.flushHeaders();
      
      const stream = await this.contentService.chat(userid, message);
      
      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('Stream complete');
            response.end();
            break;
          }
          console.log('Sending chunk:', value);
          response.write(JSON.stringify({
            content: value
          }));
        }
      } catch (error) {
        console.error('Stream reading error:', error);
        response.end();
      }
    } catch (error) {
      console.error('Service error:', error);
      response.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
      response.end();
    }
  }

  @Get('/chat/history')
  getHistory(@Request() req: any, @Query('page') page: number) {
    const userid = req.user.userid;
    return this.contentService.getHistory(Number(userid), page);
  }

  @Get('/strategy/questions')
  getStrategyQuestions(@Request() req: any, @Query('strategy') strategy: string) {
    const userid = req.user.userid;
    if(!strategy || parseInt(strategy) < 1 || parseInt(strategy) > 6) {
      throw new HttpException('strategy is limited to 1-6', HttpStatus.BAD_REQUEST);
    }
    return this.contentService.getStrategyQuestions(Number(userid), parseInt(strategy));
  }

  @Get('/references')
  getReferences(@Request() req: any, @Query('page') page: string, @Query('rtype') rtype: string, @Query('summaryId') summaryId: string) {
    const userid = req.user.userid;
    const rtypeNumber = parseInt(rtype);
    if(rtypeNumber === 0 && summaryId === undefined) {
      throw new HttpException('summaryId is required when rtype is 0', HttpStatus.BAD_REQUEST);
    }
    const summaryIdNumber = parseInt(summaryId);
    const pageNumber = parseInt(page);
    this.logger.log('getReferences', rtypeNumber, summaryId, summaryIdNumber, pageNumber);

    if(rtypeNumber < 0 || rtypeNumber > 1) {
      throw new HttpException('rtype is limited to 0-1', HttpStatus.BAD_REQUEST);
    }
    return this.contentService.getReferences(
      rtypeNumber, 
      rtypeNumber === 0 ? summaryIdNumber : userid,
      pageNumber
    );
  }

  @Get('/articles')
  getArticles(@Request() req: any, @Query('page') page: string, @Query('assetName') assetName: string) {
    this.logger.log('getArticles', assetName);
    const userid = req.user.userid;
    const pageNumber = parseInt(page);
    return this.contentService.getArticles(assetName, pageNumber);
  }

  @Post('/courses')
  writeCourses(@Request() req: any, @Body() createCourseDto: CreateCourseDto) {
    const userid = req.user.userid;
    return this.contentService.writeCourses(userid, createCourseDto);
  }

  @Get('/aicourses')
  getAIRecCourses(@Request() req: any) {
    const userid = req.user.userid;
    return this.contentService.getAIRecCourses(userid);
  }

  @Get('/courses')
  getCourses(@Request() req: any, @Query('page') page: string) {
    const pageNumber = parseInt(page);
    if(pageNumber < 1) {
      throw new HttpException('page is limited to 1', HttpStatus.BAD_REQUEST);
    }
    return this.contentService.getCourses(pageNumber);
  }

  @Post('chat/collect')
  collectChat(@Request() req: any, @Query('dialogId') dialogId: string, @Query('isCollect') isCollect: string) {
    const userid = req.user.userid;
    const dialogIdNumber = parseInt(dialogId);
    if(isNaN(dialogIdNumber)) {
      throw new HttpException('dialogId is not a number', HttpStatus.BAD_REQUEST);
    }
    const isCollectBoolean = isCollect === 'true' ? true : false;
    return this.contentService.collectChat(userid, dialogIdNumber, isCollectBoolean);
  }

  @Get('chat/collect')
  getCollectChat(@Request() req: any, @Query('page') page: string) {
    const userid = req.user.userid;
    const pageNumber = parseInt(page);
    if(pageNumber < 1) {
      throw new HttpException('page is limited to 1', HttpStatus.BAD_REQUEST);
    }
    return this.contentService.getCollectChat(userid, pageNumber);
  }

  @Post('/test/trigger')
  triggerSummaryTest(@Request() req: any, @Query('userid') userid: string) {
    this.logger.log('triggerSummaryTest', userid);
    return this.contentService.triggerContent(Number(userid));
  }

  @Get('download/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = join(process.cwd(), 'uploads', filename);
    
    if (!existsSync(filePath)) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    const file = createReadStream(filePath);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    file.pipe(res);
  }

}
