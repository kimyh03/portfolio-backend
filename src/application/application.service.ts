import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entities/post.entity';
import { Repository } from 'typeorm';
import { ToggleApplyInput, ToggleApplyOutput } from './dtos/toggleApply.dto';
import { Application } from './entities/application.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applications: Repository<Application>,
    @InjectRepository(Post)
    private readonly posts: Repository<Post>,
  ) {}

  async toggleApply(
    { postId }: ToggleApplyInput,
    userId: number,
  ): Promise<ToggleApplyOutput> {
    try {
      const post = await this.posts.findOneOrFail(postId);
      const existApplication = await this.applications.findOne({
        where: { postId, userId },
      });
      if (existApplication) {
        await this.applications.remove(existApplication);
      } else {
        if (post.isOpened === false) {
          throw new Error('모집이 마감 되었습니다.');
        } else {
          await this.applications.save(
            this.applications.create({
              postId,
              userId,
            }),
          );
        }
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}
