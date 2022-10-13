import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    //create a fake copy of the users service
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('wsz@gmail.com', 'password');
    await expect(service.signup('wsz@gmail.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('wsz123@gmail.com', 'password');
    await expect(service.signin('wsz123@gmail.com', 'abc')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if sign in is called with an unused email', async () => {
    await expect(service.signin('wsz1@gmail.com', 'password')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('wsz@gmail.com', 'mypassword');
    await expect(service.signin('wsz@gmail.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });
});
