import { db } from '../util/admin.js';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const getAllTodos = async (request, response) => {
  const allTodos = await getDocs(collection(db, 'todos'));
  let todos = [];
  allTodos.forEach((doc) => {
    todos.push({
      todoId: doc.id,
      title: doc.data().title,
      body: doc.data().body,
      createdAt: doc.data().createdAt,
    });
  });
  return response.json(todos);
};

const postOneTodo = async (request, response) => {
  if (request.body.body.trim() === '') {
    return response.status(400).json({ body: 'Must not be empty' });
  }
  if (request.body.title.trim() === '') {
    return response.status(400).json({ title: 'Must not be empty' });
  }
  const newTodoItem = {
    title: request.body.title,
    body: request.body.body,
    createdAt: new Date().toISOString()
  }
  const add = await addDoc(collection(db, 'todos'), newTodoItem);
  const responseTodoItem = newTodoItem;
  responseTodoItem.id = add.id;
  return response.json(responseTodoItem);
};

const deleteTodo = async (request, response) => {
  await deleteDoc(doc(db, 'todos', request.params.todoId))
  return response.json({ message: 'Delete successfull' });
};

const editTodo = async (request, response) => {
  if (request.body.todoId || request.body.createdAt) {
    response.status(403).json({ message: 'Not allowed to edit' });
  }
  const todoRef = doc(db, 'todos', request.params.todoId);
  await updateDoc(todoRef, {
    body: request.body.body,
    title: request.body.title,
  });
  return response.json({ message: 'Updated Successfully' });
};

export { getAllTodos, postOneTodo, deleteTodo, editTodo };
