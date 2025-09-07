import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  // 配置静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'static'), {
    index: false, // 禁用默认的index路由
  });

  // 所有未匹配的路由都返回index.html
  app.use((req, res, next) => {
    if (!req.path.startsWith('/admin') && 
      !req.path.startsWith('/assets') && 
      !req.path.startsWith('/users') &&
      !req.path.startsWith('/contents') &&
      !req.path.startsWith('/auth') &&
      !req.path.startsWith('/tasks')
    ) {
      res.sendFile(join(__dirname, '..', 'static', 'index.html'));
    } else {
      next();
    }
  });

  await app.listen(3000);
}
bootstrap();
