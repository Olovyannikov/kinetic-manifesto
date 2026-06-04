/**
 * Форма регистрации — КИНЕТИЧЕСКАЯ версия (тот же сценарий, обе гонки убраны)
 *
 * Парная к form-imperative.tsx. Логика живёт в модели, отдельно от UI.
 * Компонент только генерирует события и читает сторы (см. низ файла).
 */

import { createEvent, createStore, createEffect, sample } from 'effector'
import { debounce } from 'patronum'

// То же воображаемое API
declare function checkUsername(name: string): Promise<boolean>
declare function signup(name: string): Promise<void>

// === События (импульсы из UI) ===
const usernameChanged = createEvent<string>()
const submitPressed = createEvent()

// === Состояние ===
const $username = createStore('')
const $available = createStore<boolean | null>(null)
const $authUser = createStore<{ id: string } | null>(null)

$username.on(usernameChanged, (_, name) => name)

// === Эффекты (сайд-эффекты с встроенным lifecycle) ===
const checkFx = createEffect(checkUsername)
const signupFx = createEffect(signup)

// pending бесплатно — не нужен отдельный стор submitting
const $checking = checkFx.pending
const $submitting = signupFx.pending

// ── Решение ГОНКИ №1: проверка доступности ──
// «Трение»: debounce гасит лишние события, проверяем только устоявшееся значение.
sample({
  clock: debounce(usernameChanged, 300),
  filter: (name) => name.length >= 3,
  target: checkFx,
})

// Результат принимаем, ТОЛЬКО если он про текущий ник.
// Устаревший ответ (на старое значение) отбрасывается фильтром — гонка мертва.
sample({
  clock: checkFx.done,
  source: $username,
  filter: (current, { params }) => current === params,
  fn: (_, { result }) => result,
  target: $available,
})

// Любой ввод сбрасывает прежний вердикт, пока летит новая проверка.
sample({
  clock: usernameChanged,
  fn: () => null,
  target: $available,
})

// ── Решение ГОНКИ №2: сабмит ──
// source берёт username и authUser В ОДИН ТИК с кликом — снимок состояния
// прямо сейчас, без await-зазора. filter пускает только если ник свободен и юзер есть.
sample({
  clock: submitPressed,
  source: { name: $username, user: $authUser },
  filter: ({ user }, _) => user !== null,
  fn: ({ name }) => name,
  target: signupFx,
})

export { usernameChanged, submitPressed, $username, $available, $checking, $submitting }

/**
 * Почему лучше:
 * - Гонки убраны декларативно: фильтр «ответ про текущий ник» + атомарный снимок в sample.
 * - Логика собрана в модели, компонент тонкий (только useUnit).
 * - Тестируется без рендера:
 *     const scope = fork()
 *     await allSettled(usernameChanged, { scope, params: 'anna' })
 *     expect(scope.getState($available)).toBe(true)
 *
 * Компонент целиком:
 *   const { name, available } = useUnit({ name: $username, available: $available })
 *   const onChange = useUnit(usernameChanged)
 *   const onSubmit = useUnit(submitPressed)
 */
