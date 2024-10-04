import React, { useState, useEffect } from "react";
import axios from "axios";

const API_CHAIN_CONFIG = {
  users: {
    url: "https://jsonplaceholder.typicode.com/users",
    method: "GET",
  },
  posts: {
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "POST",
    getAllPostsByUser: (userId) => `https://jsonplaceholder.typicode.com/posts?userId=${userId}`, // Fetch posts by user ID
  },
  comments: {
    url: "https://jsonplaceholder.typicode.com/comments?postId=",
    method: "GET",
  },
};

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [postBody, setPostBody] = useState({ title: "", body: "" });
  const [createdPost, setCreatedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5; // Number of posts per page

  // Fetch the list of users
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await axios(API_CHAIN_CONFIG.users.url);
        setUsers(response.data);
      } catch (error) {
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Fetch posts for the selected user
  useEffect(() => {
    if (selectedUser) {
      async function fetchPosts() {
        try {
          setLoading(true);
          const response = await axios.get(API_CHAIN_CONFIG.posts.getAllPostsByUser(selectedUser.id));
          setPosts(response.data);
        } catch (error) {
          setError("Failed to fetch posts.");
        } finally {
          setLoading(false);
        }
      }
      fetchPosts();
    }
  }, [selectedUser]); // Re-fetch posts if the user changes or a new post is created

  // Handle post creation
  const createPost = async () => {
    if (!selectedUser || !postBody.title || !postBody.body) {
      alert("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(API_CHAIN_CONFIG.posts.url, {
        title: postBody.title,
        body: postBody.body,
        userId: selectedUser.id,
      });
         // Since the API doesn't save the post, we add it to the local state manually
    const newPost = {
      ...response.data,
      id: posts.length + 1, // Simulate a new ID
    };

    // Add the new post to the list of posts
    setPosts([newPost, ...posts]);

    setCreatedPost(newPost); // Save the newly created post for UI purposes

    // Clear the form inputs
    setPostBody({ title: "", body: "" });
    } catch (error) {
      setError("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CHAIN_CONFIG.comments.url}${postId}`);
      setComments(response.data);
      setSelectedPostId(postId); // Track which post's comments are being viewed
    } catch (error) {
      setError("Failed to fetch comments.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Handle Next Page
  const nextPage = () => {
    if (currentPage < Math.ceil(posts.length / postsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle Previous Page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Chaining Dashboard</h1>

      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Step 1: Select a user */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Step 1: Select a User</h2>
        <select
          className="border p-2 rounded mt-2"
          onChange={(e) =>
            setSelectedUser(users.find((user) => user.id === +e.target.value))
          }
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Input Post Details */}
      {selectedUser && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Step 2: Create a Post</h2>
          <input
            type="text"
            placeholder="Post Title"
            className="border p-2 rounded mt-2 w-full"
            value={postBody.title}
            onChange={(e) => setPostBody({ ...postBody, title: e.target.value })}
          />
          <textarea
            placeholder="Post Body"
            className="border p-2 rounded mt-2 w-full"
            value={postBody.body}
            onChange={(e) => setPostBody({ ...postBody, body: e.target.value })}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            onClick={createPost}
          >
            Create Post
          </button>
        </div>
      )}

      {/* Display Posts for Selected User */}
      {selectedUser && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{selectedUser.name}'s Posts</h2>
          {currentPosts.length > 0 ? (
            currentPosts.map((post) => (
              <div key={post.id} className="p-4 border mb-2">
                <h3 className="text-lg font-bold">{post.title}</h3>
                <p>{post.body}</p>
                <p className="text-sm text-gray-600">Post ID: {post.id}</p>

                {/* Button to fetch comments */}
                <button
                  className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
                  onClick={() => fetchComments(post.id)}
                >
                  View Comments
                </button>

                {/* Display Comments if viewing the selected post */}
                {selectedPostId === post.id && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">Comments:</h4>
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="p-2 border-t">
                          <p>{comment.body}</p>
                          <p className="text-sm text-gray-500">
                            - {comment.email}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p>No comments found for this post.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No posts available for this user.</p>
          )}

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-between">
            <button
              className={`bg-gray-500 text-white px-4 py-2 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className={`bg-gray-500 text-white px-4 py-2 rounded ${currentPage >= Math.ceil(posts.length / postsPerPage) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={nextPage}
              disabled={currentPage >= Math.ceil(posts.length / postsPerPage)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
