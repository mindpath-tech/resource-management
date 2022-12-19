import { EntityRepository, InsertResult, getRepository, Between } from 'typeorm';
import { insertQueryBuilderForModels } from '../utils/typeorm';
import { RatingModel } from '../models/ratings';
import { RatingRequest } from '../types/rating';

/**
 * Class perform database operation on rating table.
 */
@EntityRepository(RatingModel)
export default class RatingRepository {
  public async insert(model: RatingModel): Promise<InsertResult> {
    const insertQueryBuilder = insertQueryBuilderForModels([model]);
    return await insertQueryBuilder.execute();
  }

  public async fetchRatings(ratingRequest: RatingRequest): Promise<Array<RatingModel>> {
    return await getRepository(RatingModel).find({
      where: [
        {
          createAt: Between(new Date(ratingRequest.startDate), new Date(ratingRequest.endDate)),
        },
      ],
      relations: ['conversation', 'conversation.user'],
    });
  }
}
