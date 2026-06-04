/**
 * Простой TODO-лист на Effector
 * 
 * Правила:
 * - Используем sample вместо .on для явного потока данных
 * - Используем effect для сайд-эффектов (сохранение, загрузка)
 * - Никаких .watch для логики
 */

import { createEvent, createStore, sample, createEffect } from 'effector'

// === Типы ===
interface Todo {
  id: number
  text: string
  completed: boolean
}

// === События ===
const todoAdded = createEvent<string>()           // Добавление TODO
const todoToggled = createEvent<number>()         // Переключение статуса
const todoDeleted = createEvent<number>()         // Удаление TODO
const todosRequested = createEvent()              // Запрос списка (например, при инициализации)

// === Эффекты (для сайд-эффектов) ===
const saveToStorageFx = createEffect<Todo[], void>((todos) => {
  localStorage.setItem('todos', JSON.stringify(todos))
})

const loadFromStorageFx = createEffect<void, Todo[]>(async () => {
  const data = localStorage.getItem('todos')
  return data ? JSON.parse(data) : []
})

// === Сторы ===
const $todos = createStore<Todo[]>([])

// === Логика через sample (вместо .on) ===

// Добавление TODO
sample({
  clock: todoAdded,
  source: $todos,
  fn: (todos, text) => [
    ...todos,
    {
      id: Date.now(),
      text,
      completed: false,
    },
  ],
  target: $todos,
})

// Сохранение при каждом изменении $todos
sample({
  clock: $todos,
  target: saveToStorageFx,
})

// Переключение статуса
sample({
  clock: todoToggled,
  source: $todos,
  fn: (todos, id) =>
    todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ),
  target: $todos,
})

// Удаление TODO
sample({
  clock: todoDeleted,
  source: $todos,
  fn: (todos, id) => todos.filter((todo) => todo.id !== id),
  target: $todos,
})

// Загрузка при инициализации
sample({
  clock: todosRequested,
  target: loadFromStorageFx,
})

// Запись загруженных данных в стор
sample({
  clock: loadFromStorageFx.doneData,
  target: $todos,
})

// === Экспорт для использования в компонентах ===
export {
  todoAdded,
  todoToggled,
  todoDeleted,
  todosRequested,
  $todos,
}
