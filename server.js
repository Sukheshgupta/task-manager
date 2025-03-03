import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Task Schema
const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

const Task = mongoose.model("Task", TaskSchema);

// Default route to check if the server is running
app.get("/", (req, res) => {
  res.send("✅ Task Manager API is running...");
});

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }); // Sort by latest tasks
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Server error while fetching tasks" });
  }
});

// Create a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const newTask = new Task({ title, description });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Server error while creating task" });
  }
});

// Update task completion status
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { completed } = req.body;

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Server error while updating task" });
  }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Server error while deleting task" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
