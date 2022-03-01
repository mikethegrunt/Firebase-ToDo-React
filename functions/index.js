import * as functions from 'firebase-functions';
import express from 'express';
import { fileParser } from "express-multipart-file-parser";
import {
  getAllTodos,
  postOneTodo,
  deleteTodo,
  editTodo,
} from './APIs/todos.js';
import {
  loginUser,
  signUpUser,
  uploadProfilePhoto,
  getUserDetail,
} from './APIs/users.js';

const app = express();
app.use(fileParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/todos', getAllTodos);
app.post('/todo', postOneTodo);
app.delete('/todo/:todoId', deleteTodo);
app.put('/todo/:todoId', editTodo);
app.post('/login', loginUser);
app.post('/signup', signUpUser);
app.post('/user/image', uploadProfilePhoto);
app.get('/user', getUserDetail);

const api = functions.https.onRequest(app);

export { api };