import { PostDatabase } from "../database/PostDatabase";
import { UserDatabase } from "../database/UserDatabase";
import { LikesDislikes } from "../dtos/LikeDislike";
import {
  CreatePostInputDTO,
  DeletePostInputDTO,
  EditPostDTO,
  EditPostLikesInputDTO,
  GetPostInputDTO,
  GetPostOutputDTO,
  PostDTO,
} from "../dtos/postDTO";
import { Post } from "../models/Post";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { LikesDislikesDB, UserDB, USER_ROLES } from "../types";
import { LikesDislikesDatabase } from "./LikesDislikesDatabase";

export class PostBusiness {
  constructor(
    private postDatabase: PostDatabase,
    private userDatabase: UserDatabase,
    private tokenManager: TokenManager,
    private idGenerator: IdGenerator,
    private postDTO: PostDTO,
    private likesDislikesDatabase : LikesDislikesDatabase,
  ) {}

  public getPosts = async (
    input: GetPostInputDTO
  ): Promise<GetPostOutputDTO[]> => {
    const { token } = input;

    const payload = this.tokenManager.getPayload(token);

    if (payload === null) {
      throw new Error("token inválido");
    }

    const postsDB = await this.postDatabase.findPosts();
    const usersDB = await this.userDatabase.findUsers();

    const output = postsDB.map((postDB) => {
      const post = new Post(
        postDB.id,
        postDB.content,
        postDB.likes,
        postDB.dislikes,
        postDB.created_at,
        postDB.updated_at,
        getCreator(postDB.creator_id)
      );

      return this.postDTO.getPostOutput(post);
    });

    function getCreator(userId: string) {
      const user = usersDB.find((userDB) => userDB.id === userId) as UserDB;

      return {
        id: user.id,
        name: user.name,
      };
    }

    return output;
  };

  public createPost = async (input: CreatePostInputDTO): Promise<void> => {
    const { content, token } = input;

    const payload = this.tokenManager.getPayload(token);

    if (payload === null) {
      throw new Error("token inválido");
    }

    const id = this.idGenerator.generate();
    const createdAt = new Date().toISOString();
    const likes = 0;
    const dislikes = 0;

    const newPost = new Post(
      id,
      content,
      likes,
      dislikes,
      createdAt,
      createdAt,
      {
        id: payload.id,
        name: payload.name,
      }
    );

    const newPostDB = newPost.toDBModel();
    await this.postDatabase.createPost(newPostDB);
  };

  public updatePost = async (input: EditPostDTO): Promise<void> => {
    const { id, content, token } = input;

    const payload = this.tokenManager.getPayload(token);

    if (payload === null) {
      throw new Error("token inválido");
    }

    const postDB = await this.postDatabase.findPostById(id);

    if (!postDB) {
      throw new Error("Não foi encontrado um post com esse id");
    }

    if (payload.id !== postDB.creator_id) {
      throw new Error("Somente quem criou o post pode editá-lo");
    }

    const updatedActualized = new Date().toISOString();

    

    const editedPost = new Post(
      id,
      content,
      postDB.likes,
      postDB.dislikes,
      postDB.created_at,
      updatedActualized,
      {
        id: payload.id,
        name: payload.name,
      }
    );

    
    const editedPostDB = editedPost.toDBModel();
    console.log(editedPostDB)
    await this.postDatabase.updatePostById(editedPostDB, id);
  };

  public deletePost = async (input: DeletePostInputDTO): Promise<void> => {
    const { id, token } = input;

    const payload = this.tokenManager.getPayload(token);

    if (payload === null) {
      throw new Error("token inválido");
    }

    const postDB = await this.postDatabase.findPostById(id);

    if (!postDB) {
      throw new Error("Não foi encontrado um post com esse id");
    }

    if (payload.id !== postDB.creator_id) {
      throw new Error("Somente quem criou o post pode deleta-lo");
    }

    await this.postDatabase.deletePostById(postDB.id);
  };

  public async updatePostLikesById(input : EditPostLikesInputDTO) : Promise<void>{
    const { id , token } = input;
    const updatedLike = input.like;

    const payload = this.tokenManager.getPayload(token);
    if (payload === null){
        throw new Error("Token inválido");
    } 

    const userId = payload.id;

    const postDB = await this.postDatabase.findPostById(id);
    if (!postDB){
        throw new Error("Não foi encontrado um post com esse 'id'");
    }

    const postId = postDB.id as string;

    if (postDB.creator_id === userId){
        throw new Error("Usuário não pode dar dislike/like no próprio post");
    }

    const likesDislikesDB = await this.likesDislikesDatabase.findLikeByUserAndPostId(userId, postId);

    let deltaLikes = 0;
    let deltaDislikes = 0;

    if (!likesDislikesDB){

        const newLikesDislikes = new LikesDislikes(userId, postId);

        if (updatedLike){

            newLikesDislikes.setLike(1);
            deltaLikes = 1;
        } else {

            newLikesDislikes.setLike(0);
            deltaDislikes = 1;
        }

        const newLikesDislikesDB : LikesDislikesDB = {
            user_id : newLikesDislikes.getUserId(),
            post_id : newLikesDislikes.getPostId(),
            like : newLikesDislikes.getLike()
        }

        await this.likesDislikesDatabase.createLike(newLikesDislikesDB);
    } else {

        const like = likesDislikesDB.like;

        if ((updatedLike === Boolean(like))){

            await this.likesDislikesDatabase.deleteLikeByUserAndPostId(userId, postId);

            if (updatedLike){

                deltaLikes = -1;
            } else {

                deltaDislikes = -1;
            }

        } else {

            const updatedLike = Number(!like);
            const updatedLikesDislikes = new LikesDislikes(userId, postId, updatedLike);

            const updatedLikesDislikesDB : LikesDislikesDB = {
                user_id: updatedLikesDislikes.getUserId(),
                post_id: updatedLikesDislikes.getPostId(),
                like: updatedLikesDislikes.getLike()
            }

            await this.likesDislikesDatabase.updateLikeByUserAndPostId(
                updatedLikesDislikesDB,
                userId,
                postId
            );

            deltaLikes = updatedLike ? 1 : -1;
            deltaDislikes = updatedLike ? -1 : 1;
        }
    }

    const updatedPost = new Post(
        postId,
        postDB.content,
        postDB.likes + deltaLikes,
        postDB.dislikes + deltaDislikes,
        postDB.created_at,
        postDB.updated_at,
        {
            id: postDB.creator_id,
            name: "" 
        }
    )

    const updatedPostDB = updatedPost.toDBModel();
    await this.postDatabase.updatePostById(updatedPostDB, postId);
}

}
