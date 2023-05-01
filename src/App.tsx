import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

interface Comment {
  id: string;
  text: string;
}

function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <ul>
      {comments.map((comment) => (
        <li key={comment.id}>{comment.text}</li>
      ))}
    </ul>
  );
}

const CommentForm = React.memo(({ onSubmit }: { onSubmit: (text: string) => void }) => {
  const [text, setText] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(text);
      setText('');
    },
    [text, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
});

function App() {

  const [comments, setComments] = useState<Comment[]>([]);
  const socket = io('http://localhost:3001');


  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/comment/get', {
          _id: '644ffcfbdc6b6409b35dc7c6',
        });
        const newComments = response.data.comments.map((element: any) => {
          return { id: element._id, text: element.content };
        });
        setComments(newComments);
      } catch (error) {
        console.error(error);
      }
    };
    fetchComments();
  }, []);

  useEffect(() => {
    socket.on('comment', (comment: Comment) => {
      setComments((comments) => [...comments, comment]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCommentSubmit = useCallback(
    (text: string) => {
      const comment: Comment = { id: String(Date.now()), text };
      socket.emit('comment', comment);
      axios.post('http://localhost:5000/api/comment/create', {
        parent_id: "644ffcfbdc6b6409b35dc7c6",
        custommer_id: "63dbe51c7a055d409149d808",
        content: text || " "
      })
        .then((response) => {
        })
        .catch((error) => {
        });
    },
    [socket],
  );

  return (
    <div>
      <h1>Realtime Comments</h1>
      <CommentList comments={comments} />
      <CommentForm onSubmit={handleCommentSubmit} />
    </div>
  );
}

export default App;