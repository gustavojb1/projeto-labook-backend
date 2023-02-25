import { PostDB } from "../types";
import { BaseDatabase } from "./BaseDatabase";

export class PostDatabase extends BaseDatabase {
  public static TABLE_POST = "posts";

  public async findPosts() {
    const result: PostDB[] = await BaseDatabase.connection(
      PostDatabase.TABLE_POST
    );

    return result;
  }

  public async createPost(newPostDB: PostDB) {
    await BaseDatabase.connection(PostDatabase.TABLE_POST).insert(newPostDB);
  }

  public async findPostById(id : string){
    const [ result ] : PostDB[] | undefined[] = await BaseDatabase
        .connection(PostDatabase.TABLE_POST)
        .where({ id });
    return result;
}

  public async updatePostById(updatedPostDB : PostDB, id : string){
    await BaseDatabase
        .connection(PostDatabase.TABLE_POST)
        .where({ id })
        .update(updatedPostDB)
  }

  public async deletePostById(id : string){
    await BaseDatabase
        .connection(PostDatabase.TABLE_POST)
        .del()
        .where({ id });
}
}
