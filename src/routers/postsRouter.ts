import express from 'express'
import { LikesDislikesDatabase } from '../business/LikesDislikesDatabase'
import { PostBusiness } from '../business/PostBusiness'
import { PostController } from '../controller/PostController'
import { PostDatabase } from '../database/PostDatabase'
import { UserDatabase } from '../database/UserDatabase'
import { PostDTO } from '../dtos/postDTO'
import { IdGenerator } from '../services/IdGenerator'
import { TokenManager } from '../services/TokenManager'


export const postRouter = express.Router()

const postController = new PostController(
    new PostBusiness(
        new PostDatabase(),
        new UserDatabase(),
        new TokenManager(),
        new IdGenerator(),
        new PostDTO(),
        new LikesDislikesDatabase()
    ), new PostDTO()
)

postRouter.get('/', postController.getPost)

postRouter.post('/', postController.createPost)

postRouter.put('/:id', postController.updatePost);

postRouter.delete('/:id', postController.deletePost);

postRouter.put("/:id/like", postController.updatePostLikes);

