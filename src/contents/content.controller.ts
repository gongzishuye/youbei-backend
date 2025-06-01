import { Controller, Get, Post, Body, Logger, Param, Delete, Request, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('contents')
export class ContentController {

  private logger = new Logger(ContentController.name);

  constructor(private readonly contentService: ContentService,
  ) {}

  @Get('streaming')
  create() {
    return this.contentService.streaming();
  }

  @Post('summary')
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

  @Post('questions')
  getQuestions(@Query('referenceId') referenceId: string, @Query('summary') summary: string) {
    this.logger.log('getQuestions', referenceId, summary);
    return this.contentService.getQuestions(Number(referenceId), summary);
  }

  @Post('chat')
  chat(@Request() req: any, @Body('message') message: string) {
    const userid = req.user.userid;
    return this.contentService.chat(Number(userid), message);
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
}
