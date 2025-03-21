import { Injectable } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import OpenAI from 'openai';

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

@Injectable()
export class ContentService {
  async main() {

    const openai = new OpenAI({
      apiKey: 'ca0c7f9c-56ec-4693-a9d5-97c168b1c754',
      baseURL: 'https://ark.cn-beijing.volces.com/api/v3/bots',
    });

    // Streaming:
    console.log('----- streaming request -----')
    const stream = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: '你是人工智能助手' },
        { role: 'user', content: '美联储有什么动态' },
      ],
      model: 'bot-20250320172734-gcwj7',
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

  findAll() {
    return `This action returns all content`;
  }

  findOne(id: number) {
    return `This action returns a #${id} content`;
  }

  update(id: number, updateContentDto: UpdateContentDto) {
    return `This action updates a #${id} content`;
  }

  remove(id: number) {
    return `This action removes a #${id} content`;
  }
}