import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';

import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { QUEUES } from '../../../common/constants';
import { UtilsService } from '../../../common/utils/UtilsService';

@Injectable()
@Processor(QUEUES.REPORT.NAME)
export class ReportProcessor implements OnModuleDestroy, OnModuleInit {
  private available = false;

  constructor(
    @InjectQueue(QUEUES.REPORT.NAME)
    private readonly jobQueue: Queue,
    private readonly utilService: UtilsService,
  ) {
    try {
      this.jobQueue.client.on('end', async () => {
        await this.reconnect();
      });
      this.jobQueue.client.on('error', async (err) => {
        console.error(err);
        const { status } = this.jobQueue.client;
        if (status !== 'connecting') {
          await this.jobQueue.client.quit();
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  async onModuleDestroy() {
    if (this.available) {
      await this.jobQueue.pause();
    }
  }

  async onModuleInit() {
    await this.connectionReady();
    if (this.available) {
      await this.jobQueue.resume();
    }
  }

  @Process({
    name: QUEUES.REPORT.PROCESSOR,
    concurrency: 1,
  })
  async handleQueueJobs(job: Job<any>) {
    if (this.available) {
      const { data } = job;

      const { leadId }: { leadId: number } = data;
    }
  }

  async cleanQueue() {
    if (this.available) {
      await this.jobQueue.clean(0, 'completed');
      await this.jobQueue.clean(0, 'failed');
    }
    return true;
  }

  async connectionReady() {
    try {
      const res = await this.utilService.redisAvailabilityCheck(
        this.jobQueue.client,
      );
      if (res) {
        this.available = true;
      }
    } catch (error) {
      console.error(error);
      this.available = false;
      throw new Error('Redis connection failed');
    }
  }

  async reconnect() {
    await this.jobQueue.client.connect();
    await this.connectionReady();
  }
}
