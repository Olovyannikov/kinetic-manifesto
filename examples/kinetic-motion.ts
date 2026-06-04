/**
 * «Кинетика буквально» — физика движения на тех же примитивах Effector.
 *
 * Демонстрация к бонус-слайду: тот же sample, что гоняет бизнес-логику,
 * моделирует настоящую физику — скорость, инерцию, трение, доводку (lerp).
 * Сценарий: перетаскиваемая карточка, которая после отпускания летит по инерции
 * и пружинит к цели (как Tinder-свайп / инерционный скролл).
 */

import { createEvent, createStore, sample } from 'effector'

// === События из внешнего мира ===
const dragMoved = createEvent<number>()  // палец/мышь сдвинулись в X
const dragEnded = createEvent()          // отпустили
const tick = createEvent()               // пульс requestAnimationFrame (каждый кадр)

// === Кинетическое состояние (физические величины, а не «открыто/закрыто») ===
const $pos = createStore(0)        // текущая координата на экране
const $target = createStore(0)     // куда тянем
const $velocity = createStore(0)   // скорость — ядро кинетики
const $dragging = createStore(false)

$dragging.on(dragMoved, () => true).on(dragEnded, () => false)

const FRICTION = 0.92   // трение: гасит скорость каждый кадр
const SPRING = 0.15     // жёсткость пружины (доводка к цели)

// Пока тянем — цель следует за пальцем, попутно считаем скорость импульса
sample({
  clock: dragMoved,
  source: $pos,
  fn: (prev, next) => next - prev,
  target: $velocity,
})
$target.on(dragMoved, (_, x) => x)

// Каждый кадр, когда отпущено: позиция догоняет цель (lerp) + затухающая инерция.
// Это ровно тот же sample, что и в бизнес-логике — меняется лишь смысл данных.
sample({
  clock: tick,
  source: { pos: $pos, target: $target, v: $velocity, dragging: $dragging },
  filter: ({ dragging }) => !dragging,
  fn: ({ pos, target, v }) => pos + (target - pos) * SPRING + v,
  target: $pos,
})

// Трение: скорость затухает с каждым кадром, пока движение не остановится
sample({
  clock: tick,
  source: $velocity,
  fn: (v) => (Math.abs(v) < 0.01 ? 0 : v * FRICTION),
  target: $velocity,
})

export { dragMoved, dragEnded, tick, $pos, $velocity }

/**
 * Подключение к DOM (в обход ре-рендеров React — напрямую двигаем ноду, 120 FPS):
 *
 *   $pos.watch((x) => { card.style.transform = `translateX(${x}px)` })
 *   const loop = () => { tick(); requestAnimationFrame(loop) }
 *   requestAnimationFrame(loop)
 *
 * Мысль демо: «состояние, которое движется» — это не только данные.
 * Это может быть буквально координата в пространстве, и тот же граф ECA её ведёт.
 */
