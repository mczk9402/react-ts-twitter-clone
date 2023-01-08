import { Avatar } from "@material-ui/core";
import { Send } from "@material-ui/icons";
import firebase from "firebase";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { db } from "../firebase";
import styles from "./Post.module.css";

interface Props {
  post: {
    id: string;
    avatar: string;
    image: string;
    text: string;
    timestamp: any;
    username: string;
  };
}

interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}

const Post: React.FC<Props> = ({ post }) => {
  const user = useSelector(selectUser);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);

  const onChangeComment = (e: ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    db.collection("posts").doc(post.id).collection("comments").add({
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    });

    setComment("");
  };

  useEffect(() => {
    if (!post.id) return;

    const unSub = db
      .collection("posts")
      .doc(post.id)
      .collection("comments")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            username: doc.data().username,
            timestamp: doc.data().timestamp,
          }))
        );
      });

    return () => {
      unSub();
    };
  }, [post.id]);

  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={post.avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{post.username}</span>
              <span className={styles.post_headerTime}>
                {new Date(post.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{post.text}</p>
          </div>
          {post.image && (
            <div className={styles.post_tweetImage}>
              <img src={post.image} alt="tweet" />
            </div>
          )}

          {comments.map((com) => (
            <div key={com.id}>
              <Avatar src={com.avatar} />
              <span className={styles.post_commentUser}>@{com.username}</span>
              <span className={styles.post_commentText}>{com.text} </span>
              <span className={styles.post_headerTime}>
                {new Date(com.timestamp?.toDate()).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={newComment}>
          <div className={styles.post_form}>
            <input
              className={styles.post_input}
              placeholder="type new comment..."
              value={comment}
              onChange={onChangeComment}
              type="text"
            />
            <button
              disabled={!comment}
              className={
                comment ? styles.post_button : styles.post_buttonDisabled
              }
              type="submit"
            >
              <Send className={styles.post_sendIcon} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Post;
