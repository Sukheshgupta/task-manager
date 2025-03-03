import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is loaded
import "./App.css"; // Import custom styles

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState(""); // State for new task title
  const [description, setDescription] = useState(""); // State for new task description

  // Fetch tasks from the backend
  useEffect(() => {
    axios
      .get("http://localhost:5001/api/tasks")
      .then((response) => setTasks(response.data))
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  // Handle task creation
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/api/tasks", {
        title,
        description,
      });
      setTasks([response.data, ...tasks]); // Add new task to UI
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Function to mark task as completed
  const handleCompleteTask = async (id, completed) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map(task => (task._id === id ? response.data : task))); // Update UI
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Function to delete task
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id)); // Remove from UI
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Task Manager</h1>

      {/* Task Creation Form */}
      <form onSubmit={handleAddTask} className="mb-4">
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Task Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Add Task
        </button>
      </form>

      {/* Task List */}
      <div className="row">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div className="col-md-4 mb-3" key={task._id}>
              <div className="card p-3 shadow">
                <h5 className="card-title">{task.title}</h5>
                <p className="card-text">{task.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    className={`btn btn-sm ${task.completed ? "btn-success" : "btn-warning"}`}
                    onClick={() => handleCompleteTask(task._id, task.completed)}
                  >
                    {task.completed ? "Completed" : "Mark as Done"}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTask(task._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No tasks available</p>
        )}
      </div>
    </div>
  );
}

export default App;
