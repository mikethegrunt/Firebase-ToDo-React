import * as functions from 'firebase-functions';
import express from 'express';
import {
  getAllTodos,
  postOneTodo,
  deleteTodo,
  editTodo,
} from './APIs/todos.js';
import { loginUser, signUpUser } from './APIs/users.js';

const app = express();

app.get('/todos', getAllTodos);
app.post('/todo', postOneTodo);
app.delete('/todo/:todoId', deleteTodo);
app.put('/todo/:todoId', editTodo);
app.post('/login', loginUser);
app.post('/signup', signUpUser);

const api = functions.https.onRequest(app);

export { api };