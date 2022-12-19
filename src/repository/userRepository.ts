import { EntityRepository, getRepository, InsertResult, UpdateResult } from 'typeorm';
import { insertQueryBuilderForModels } from '../utils/typeorm';
import { UserModel } from '../models/user';

/**
 * Class perform database operation on user table.
 */
@EntityRepository(UserModel)
export default class UserRepository {
  public async update(id: string, model: Partial<UserModel>): Promise<UpdateResult> {
    return await getRepository(UserModel).update({ id }, model);
  }

  public async insert(model: UserModel): Promise<InsertResult> {
    const insertQueryBuilder = insertQueryBuilderForModels([model]);
    return await insertQueryBuilder.execute();
  }
}
