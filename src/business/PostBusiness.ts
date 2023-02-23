import { PostDatabase } from "../database/PostDatabase";
import { UserDatabase } from "../database/UserDatabase";
import {
  CreatePostInputDTO,
  DeletePostInputDTO,
  EditPostDTO,
  GetPostInputDTO,
  GetPostOutputDTO,
  PostDTO,
} from "../dtos/postDTO";
import { Post } from "../models/Post";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { UserDB, USER_ROLES } from "../types";

export class PostBusiness {
  constructor(
    private postDatabase: PostDatabase,
    private userDatabase: UserDatabase,
    private tokenManager: TokenManager,
    private idGenerator: IdGenerator,
    private postDTO: PostDTO
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

    if (!postDB){
      throw new Error("Não foi encontrado um post com esse id");
    }

    if (payload.id !== postDB.creator_id){
      throw new Error("Somente quem criou o post pode editá-lo");
    }

    const updatedAt = (new Date()).toISOString();


    const editedPost = new Post(
       id,
       content,
       postDB.likes,
       postDB.dislikes,
       postDB.created_at,
       updatedAt,
       {
         id: payload.id,
         name: payload.name,
       })

      const editedPostDB = editedPost.toDBModel();
      await this.postDatabase.updatePostById(editedPostDB, id);
      
      }

      public deletePost = async (input: DeletePostInputDTO): Promise<void> => {
        const { id, token } = input;
    
        const payload = this.tokenManager.getPayload(token);
    
        if (payload === null) {
          throw new Error("token inválido");
        }
    
        const postDB = await this.postDatabase.findPostById(id);
    
        if (!postDB){
          throw new Error("Não foi encontrado um post com esse id");
        }
    
        if (payload.id !== postDB.creator_id){
          throw new Error("Somente quem criou o post pode deleta-lo");
        }    
       
      
          await this.postDatabase.deletePostById(postDB.id);
          
          }
      
}
