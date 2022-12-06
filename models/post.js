class Post{
    comments = [];
    constructor(src_user_id=0, dest_user_id=0, post_date="", message="", is_public=0, id=0) {
        this.id = id;
        this.src_user_id = src_user_id;
        this.dest_user_id = dest_user_id;
        this.post_date = post_date;
        this.message = message;
        this.is_public = is_public;
    }

    fromDB(dbo) {
        this.id = dbo.id;
        this.src_user_id = dbo.src_user_id;
        this.dest_user_id = dbo.dest_user_id;
        this.post_date = dbo.post_date;
        this.message = dbo.message;
        this.is_public = dbo.is_public;
        return this;
    }
    setComments(c){this.comments = c;}
    getComments(db, post)
    {
        return db.query(`
        SELECT * FROM comments 
        WHERE comments.other_id = ?;
        `,
        [post.id]);
    }
}

module.exports = Post;