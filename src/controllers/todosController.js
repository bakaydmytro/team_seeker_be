//controllers/todosController.js

const Todo = require('../models/todoModel');
const { User } = require('../config/db'); 
const user = await User.findById(req.user.id);

if (!user) {
  res.status(401);
  throw new Error("User not found");
}

if (todo.user.toString() !== user.id) {
  res.status(401);
  throw new Error("User not authorized");
}

//creating a new Todo
const setTodo = asyncHanlder(async (req, res) => {
  if (!req.body.text) {
    res.status(400);
    throw new Error('Please add text field');
  }
  const todo = await Todo.create({
    text: req.body.text,
    user: req.user.id, 
  });
  res.status(200).json(todo);
})

//getting all Todos
const getTodos = asyncHanlder(async (req, res) => {
  const todos = await Todo.find({ user: req.user.id });
  res.status(200).json(todos);
});

//updating Todo by ID
const updateTodo = asyncHanlder(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    res.status(400);
    throw new Error('Todo not found');
  }

  const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedTodo);
})


//deleting Todo by ID
const deleteTodo = asyncHanlder(async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    res.status(400);
    throw new Error('Todo not found');
  }

  await todo.remove();

  res.status(200).json({ id: req.params.id });
})


module.exports = {
  setTodo,
  getTodos,
  updateTodo,
  deleteTodo,
};

  
  
  
  
  
  
  
  