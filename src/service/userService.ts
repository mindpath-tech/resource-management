import { UserModel } from '../models/user';
import UserRepository from '../repository/userRepository';
import { InsertResult, UpdateResult } from 'typeorm';

/**
 * Perform all the business logic related to user.
 */
export class UserService {
  private _userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this._userRepository = userRepository;
  }

  public async addNewUser(userModel: UserModel): Promise<InsertResult> {
    return await this._userRepository.insert(userModel);
  }

  public async updateUser(id: string, userModel: Partial<UserModel>): Promise<UpdateResult> {
    return await this._userRepository.update(id, userModel);
  }
}
