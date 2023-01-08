import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import TweetInput from "./TweetInput";
import styles from "./Feed.module.css";
import Post from "./Post";

interface POST {
  id: string;
  avatar: string;
  image: string;
  timeStamp: null;
  username: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState([
    {
      id: "",
      avatar: "",
      image: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);

  useEffect(() => {
    const unSub = db
      .collection("posts")
      .orderBy("timestamp", "desc")
      // 変更があるたびに取得するようになる
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            // フィールドは data() を使う
            avatar: doc.data().avatar,
            image: doc.data().image,
            text: doc.data().text,
            timestamp: doc.data().timestamp,
            username: doc.data().username,
          }))
        );
      });
    console.log(posts);

    return () => {
      unSub();
    };
  }, []);

  return (
    <div className={styles.feed}>
      <TweetInput />

      {posts.map((post) => (
        <Post post={post} key={post.id} />
      ))}

      <button onClick={() => auth.signOut()} type="button">
        LOGOUT
      </button>
    </div>
  );
};

export default Feed;
