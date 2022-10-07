import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  //Create a user
  create(email: string, password: string) {
    const user = this.repo.create({ email, password });

    return this.repo.save(user);
  }
  //Get a specific user
  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  //Get all users
  find(email: string) {
    return this.repo.find({ where: { email } });
  }
  //attrs对应的可以是email， 或者email， password 或者password等等，也可以是空。只要是在user entity中的
  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found!');
    }
    //build in function Object.assign()
    Object.assign(user, attrs);
    //finally save our update
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found!');
    }
    //remove(user) Entity || delete(id)
    return this.repo.remove(user);
  }
}
