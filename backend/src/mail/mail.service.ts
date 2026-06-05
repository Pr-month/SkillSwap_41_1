import { mailConfig, IMailConfig } from '../config/mail.config';
import { SendDto } from './dto/send.dto';
import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(
    @Inject(mailConfig.KEY) private readonly mailConfig: IMailConfig,
  ) {}

  async sendNotification(
    dto: SendDto
  ): Promise<void> {
    const url = `${this.mailConfig.baseUrl}/mail/send`;

    const result = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    if (!result.ok) {
      throw new ServiceUnavailableException('Failed to send email notification');
    }
  }
}
