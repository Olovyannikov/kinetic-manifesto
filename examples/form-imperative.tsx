/**
 * Форма регистрации — ИМПЕРАТИВНАЯ версия (как обычно пишут)
 *
 * Сценарий: пользователь вводит ник → асинхронно проверяем доступность →
 * по сабмиту регистрируем. Звучит просто. Но здесь спрятаны ДВЕ гонки.
 *
 * Это «до». Парная кинетическая версия — в form-effector.ts.
 */

import { useEffect, useState } from 'react'

// Воображаемое API (медленное и с непредсказуемой задержкой)
declare function checkUsername(name: string): Promise<boolean>
declare function signup(name: string): Promise<void>
declare let globalAuthUser: { id: string } | null

export function SignupForm() {
  const [username, setUsername] = useState('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // ❌ ГОНКА №1: проверка доступности.
  // Каждый ввод запускает запрос. Ответы приходят НЕ по порядку:
  // напечатал "an" → "ann" → "anna", но ответ на "an" прилетел последним
  // и перезаписал результат для "anna". UI показывает доступность чужого ника.
  useEffect(() => {
    if (username.length < 3) {
      setAvailable(null)
      return
    }
    checkUsername(username).then((ok) => {
      // Здесь нет проверки, что username всё ещё равен тому, что мы спрашивали.
      setAvailable(ok)
    })
  }, [username])

  // ❌ ГОНКА №2: сабмит.
  // Пока летит запрос, и username, и globalAuthUser могут измениться.
  // Что именно мы отправим — зависит от тайминга. Невоспроизводимо.
  async function handleSubmit() {
    setSubmitting(true)
    const ok = await checkUsername(username) // ждём…
    if (!ok) {
      setSubmitting(false)
      return
    }
    const user = globalAuthUser // а если разлогинился, пока ждали?
    if (!user) {
      setSubmitting(false)
      return
    }
    await signup(username) // какой username сейчас в state — неизвестно
    setSubmitting(false)
  }

  return (
    <form onSubmit={(e) => (e.preventDefault(), handleSubmit())}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      {available === true && <span>✅ свободно</span>}
      {available === false && <span>❌ занято</span>}
      <button disabled={submitting || available !== true}>Зарегистрироваться</button>
    </form>
  )
}

/**
 * Почему это больно:
 * - Логика гонки спрятана в useEffect и async-функции, размазана по компоненту.
 * - Чтобы протестировать — нужен рендер, моки таймеров, jsdom.
 * - Баг проявляется только при быстром вводе / медленной сети. Плавающий.
 */
