const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }
  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  try {
    users.push({
      id: uuidv4(),
      name: request.body.name,
      username: request.body.username,
      todos: [],
    });
    return response.status(201).send();
  } catch (error) {
    return response.status(400).json({ error });
  }
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  try {
    return response.json(user.todos);
  } catch (error) {
    return response.status(400).json({ error });
  }
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  try {
    user.todos.push({
      id: uuidv4(),
      title: request.body.title,
      done: false,
      deadline: new Date(request.body.deadline),
      created_at: new Date(),
    });

    return response.status(201).send();
  } catch (error) {}
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  try {
    const todo = user.todos.find((todo) => todo.id === id);

    if (!todo) return response.status(400).json({ error: "Task not found!" });

    const todoIndex = user.todos.indexOf(todo);

    if (request.body.title) todo.title = request.body.title;
    if (request.body.deadline) todo.deadline = new Date(request.body.deadline);

    user.todos[todoIndex] = todo;

    return response.status(201).send();
  } catch (error) {
    return response.status(400).json();
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  try {
    const todo = user.todos.find((todo) => todo.id === id);

    if (!todo) return response.status(400).json({ error: "Task not found!" });
    const todoIndex = user.todos.indexOf(todo);

    todo.done = true;
    user.todos[todoIndex] = todo;
    return response.status(201).send();
  } catch (error) {
    response.status(400).json(error);
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  try {
    const todo = user.todos.find((todo) => todo.id === id);

    if (!todo) return response.status(400).json({ error: "Task not found!" });
    
    const todoIndex = user.todos.indexOf(todo);
    user.todos.splice(todoIndex, 1);
    return response.status(204).send();
  } catch (error) {
    response.status(400).json(error);
  }
});

module.exports = app;
