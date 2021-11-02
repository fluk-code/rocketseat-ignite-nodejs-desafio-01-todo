const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = []

function checkExistsUserAccount(req, res, next) {
  const { username } = req.headers

  const user =  users.find(user => user.username === username)

  if(!user){
    return res.status(400).json({
      error: "User not found!"
    })
  }

  req.user = user
  return next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const userAlreadyExists = users.some(user => user.username === username)

  if(userAlreadyExists){
    return res.status(400).send({
      error: "User already exists!"
    })
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)
  return res.status(201).json(user)

})

app.get('/todos', checkExistsUserAccount, (req, res) => {
  const { user } = req
  return res.status(200).json(user.todos)
})

app.post('/todos', checkExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body
  const { user } = req

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return res.status(201).json(todo)
  
})

app.put('/todos/:id', checkExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params
  const { title, deadline } = req.body

  const todo = user.todos.find(todo => todo.id === id)
  
  if(!todo){ 
    return res.status(404).send({
      error: "ID Todo does not exist!"
    })
  }
  todo.title = title   
  todo.deadline = new Date(deadline)   


  return res.status(200).json(todo)

})

app.patch('/todos/:id/done', checkExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    return res.status(404).json({
      error: "ID Todo does not exist!"
    })
  }

  todo.done = true
  return res.status(200).json(todo)

})

app.delete('/todos/:id', checkExistsUserAccount, (req, res) => {
  const { user } = req
  const { id } = req.params

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) {
    return res.status(404).json({
      error: "ID Todo does not exist!"
    })
  }
  user.todos.splice(todo, 1)
  return res.status(204).end()
})

module.exports = app;