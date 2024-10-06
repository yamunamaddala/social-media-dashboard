import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const SocialMediaDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showComments, setShowComments] = useState({});

  // Fetch posts from the API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    
    fetchPosts();
  }, []);

  // Memoized version of posts to optimize rendering
  const memoizedPosts = useMemo(() => posts, [posts]);

  // Handle liking a post
  const handleLike = useCallback((postId) => {
    const updatedPosts = memoizedPosts.map(post =>
      post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
    );
    setPosts(updatedPosts);
  }, [memoizedPosts]);

  // Handle adding a new post
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
        title: newPost,
        body: '',
        userId: 1,
      });
      setPosts([...memoizedPosts, response.data]);
      setNewPost('');
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // Filter posts based on the search term
  const filteredPosts = useMemo(() => {
    return memoizedPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [memoizedPosts, searchTerm]);

  return (
    <div className="dashboard">
      <h1>Social Media Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="New post"
        />
        <button type="submit">Post</button>
      </form>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search posts"
        className="search-input"
      />
      {filteredPosts.map((post) => (
        <div key={post.id} className="post">
          <h2>{post.title}</h2>
          <p>{post.body}</p>
          <button onClick={() => handleLike(post.id)}>
            Like ({post.likes || 0})
          </button>
          <button onClick={() => setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}>
            {showComments[post.id] ? 'Hide comments' : 'Show comments'}
          </button>
          {showComments[post.id] && (
            <LazyComments postId={post.id} />
          )}
        </div>
      ))}
    </div>
  );
};

// Lazy loading comments component
const LazyComments = ({ postId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [postId]);

  return (
    <div className="comments">
      <h3>Comments:</h3>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>{comment.body}</li>
        ))}
      </ul>
    </div>
  );
};

export default SocialMediaDashboard;