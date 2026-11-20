import { expect, test, type Page } from '@playwright/test'
import { mkdir, readFile } from 'node:fs/promises'

const button = (page: Page, name: string | RegExp) => page.getByRole('button', { name, exact: typeof name === 'string' })

async function startSasha(page: Page) {
  await page.goto('/')
  await button(page, 'Начать проверку').click()
  await expect(page.getByText('Агент Клён')).toHaveCount(0)
  await expect(button(page, /Нияз/)).toBeVisible()
  await button(page, /Саша/).click()
}

async function choose(page: Page, name: RegExp, reveal: string, checkResult?: () => Promise<void>) {
  await expect(button(page, reveal)).toBeDisabled()
  await button(page, name).click()
  await expect(button(page, reveal)).toBeEnabled()
  await button(page, reveal).click()
  await checkResult?.()
  await button(page, 'К следующему этапу').click()
}

for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }]) {
  test(`полный раунд Саши · ${viewport.width}×${viewport.height}`, async ({ page }, info) => {
    const errors: Error[] = []
    page.on('pageerror', error => errors.push(error))
    await page.setViewportSize(viewport)
    const fitViewport = async () => {
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      }))).toEqual(viewport)
    }
    const capture = async (name: string) => {
      await fitViewport()
      await page.evaluate(() => Promise.all(Array.from(document.images)
        .filter(image => !image.hidden).map(image => image.decode().catch(() => {}))))
      const folder = process.env.SHOW_SCREENSHOTS
      if (folder) await mkdir(folder, { recursive: true })
      const file = `${viewport.width}-${name}.png`
      const path = folder ? `${folder}/${file}` : info.outputPath(file)
      await page.screenshot({ path, animations: 'disabled' })
      if (!folder) await info.attach(file, { path, contentType: 'image/png' })
    }
    await startSasha(page)
    await expect(page.getByRole('heading', { name: 'Внеочередная проверка' })).toBeVisible()
    await capture('01-intro')
    await button(page, 'Вызвать гражданина').click()
    await expect(page.getByRole('img', { name: 'Портрет: Саша' })).toBeVisible()
    await button(page, 'Паспорт').click()
    const passport = page.getByRole('dialog', { name: 'Паспорт' })
    await expect(passport.getByRole('img', { name: 'Портрет: Саша' })).toBeVisible()
    await capture('02-documents')
    await page.getByRole('dialog').getByRole('button', { name: 'Досье', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Досье' }).getByRole('listitem')).toHaveCount(4)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByText(/Запись про школьную рок-группу добавили/)).toHaveCount(0)
    await choose(page, /Пела в школьной рок-группе/, 'Проверить', fitViewport)
    await expect(page.getByRole('heading', { name: 'Два аэропорта', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Как в деле одного рейса оказались два аэропорта?' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Посадочный талон' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Отметка о прибытии' })).toBeVisible()
    await expect(page.locator('.choice')).toHaveCount(0)
    await expect(page.getByText('Посадка состоялась', { exact: true })).toHaveCount(0)
    await expect(page.getByText(/На корпоративе вывела нас/)).toHaveCount(0)
    await capture('03-airports')
    await expect(button(page, 'Открыть развязку')).toBeEnabled()
    await button(page, 'Открыть развязку').click()
    await expect(page.getByText(/Пассажир и самолёт встретились в Шереметьево/)).toBeVisible()
    await expect(page.getByText('По земле', { exact: true })).toBeVisible()
    await expect(page.getByText(/На корпоративе вывела нас/)).toBeVisible()
    await capture('08-flight-reveal')
    await expect(button(page, 'Сформировать заключение')).toHaveCount(0)
    await button(page, 'К награждению').click()
    await expect(page.getByRole('heading', { name: 'Медаль «Маршрут перестроен»' })).toBeVisible()
    await expect(page.getByText('APPROVED', { exact: true })).toHaveCount(0)
    await button(page, 'Поставить печать').click()
    await expect(page.getByText('APPROVED', { exact: true })).toBeVisible()
    await capture('04-award')
    await button(page, 'Закрыть дело').click()
    await expect(page.getByRole('heading', { name: 'Выберите гражданина' })).toBeVisible()
    await expect(page.getByText('Одобрено 1 из 3')).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('неверный ответ, возврат, перезапуск этапа и раунда', async ({ page }) => {
  await startSasha(page)
  await button(page, 'Вызвать гражданина').click()
  await button(page, /Видела северное сияние/).focus()
  await page.keyboard.press('ArrowDown')
  await expect(button(page, /олимпиаде «Кенгуру»/)).toBeFocused()
  await page.keyboard.press('Space')
  await button(page, 'Проверить').click()
  await expect(page.getByText('Версия проверена')).toBeVisible()
  await button(page, 'К следующему этапу').click()
  await button(page, 'Назад').click()
  await expect(page.getByText('Подделка', { exact: true })).toBeVisible()
  await button(page, 'Панель ведущего').click()
  await button(page, 'Перезапустить этап').click()
  await expect(button(page, 'Проверить')).toBeDisabled()
  await button(page, /Видела северное сияние/).click()
  await page.keyboard.press('r')
  await button(page, 'Отмена').click()
  await expect(button(page, 'Проверить')).toBeEnabled()
  await page.keyboard.press('r')
  await button(page, 'Начать заново').click()
  await button(page, 'Вызвать гражданина').click()
  await expect(button(page, 'Проверить')).toBeDisabled()
})

test('учебное дело проходит тем же движком и не засчитывается гостям', async ({ page }) => {
  await page.goto('/')
  await button(page, 'Панель ведущего').click()
  await expect(page.getByText('Нияз')).toHaveCount(0)
  await expect(page.getByText('Марк')).toHaveCount(0)
  await button(page, 'Запустить демо').click()
  await button(page, 'Вызвать гражданина').click()
  await choose(page, /паровозе/, 'Проверить')
  await choose(page, /В переговорной/, 'Открыть развязку')
  for (const name of [/Чайный след/, /Тёплый чайник/]) await button(page, name).click()
  await button(page, 'Сформировать заключение').click()
  await button(page, 'К следующему этапу').click()
  await button(page, 'К награждению').click()
  await expect(page.getByRole('heading', { name: 'Звезда чайного снабжения' })).toBeVisible()
  await button(page, 'Поставить печать').click()
  await button(page, 'Закрыть дело').click()
  await expect(page.getByRole('heading', { name: 'Выберите гражданина' })).toBeVisible()
  await expect(button(page, /Саша/)).toBeVisible()
})

test('ошибка исходных данных появляется в интерфейсе разработки', async ({ page }) => {
  const file = await readFile(new URL('../src/content/characters/sasha.json', import.meta.url), 'utf8')
  const invalid = JSON.parse(file)
  invalid.scenes[0].answerId = 'missing'
  await page.route('**/src/content/characters/sasha.json*', route => route.fulfill({
    contentType: 'text/javascript',
    body: `export default ${JSON.stringify(invalid)}`,
  }))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Ошибка в материалах дела' })).toBeVisible()
  await expect(page.getByText(/scenes\.0\.answerId/)).toBeVisible()
})

for (const [width, height] of [[1366, 768], [1920, 1080]]) {
  test(`три личных дела, награды и общий финал · ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height })
    const checkLayout = async () => {
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      }))).toEqual({ width, height })
    }
    const capture = async (name: string) => {
      await checkLayout()
      const folder = process.env.SHOW_SCREENSHOTS
      if (folder) await mkdir(folder, { recursive: true })
      const file = `${width}-${name}.png`
      await page.screenshot({ path: folder ? `${folder}/${file}` : info.outputPath(file), animations: 'disabled' })
    }
    await page.goto('/')
    await button(page, 'Начать проверку').click()
    await expect(button(page, /Марк/)).toBeVisible()
    await button(page, /Саша/).click()
    await button(page, 'Вызвать гражданина').click()
    await expect(page.getByRole('img', { name: 'Портрет: Саша' })).toBeVisible()
    await expect(page.locator('.window-mark')).toHaveText('ы')
    await button(page, 'Паспорт').click()
    await expect(page.getByRole('dialog').getByRole('img', { name: 'Портрет: Саша' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText('Открыто 1 из 2')).toBeVisible()
    await choose(page, /Пела в школьной рок-группе/, 'Проверить')
    await expect(button(page, 'Открыть развязку')).toBeEnabled()
    await button(page, 'Открыть развязку').click()
    await button(page, 'К награждению').click()
    await expect(page.getByRole('heading', { name: 'Медаль «Маршрут перестроен»' })).toBeVisible()
    await button(page, 'Поставить печать').click()
    await button(page, 'Следующее дело · Нияз').click()

    await checkLayout()
    await button(page, 'Вызвать гражданина').click()
    await expect(page.getByRole('img', { name: 'Портрет: Нияз' })).toBeVisible()
    await expect(page.locator('.window-mark')).toHaveCount(0)
    await expect(page.getByText('Открыто 0 из 2')).toBeVisible()
    await expect(page.getByText(/Связь есть. Кадр уточняется/)).toBeVisible()
    await expect(button(page, /Любит волейбол/)).toBeVisible()
    await expect(button(page, /Бывал на рыбалке/)).toHaveCount(0)
    await expect(page.locator('.visitor-window')).toHaveClass(/window-forehead/)
    await capture('09-niyaz-window')
    await button(page, 'Паспорт').click()
    await expect(page.getByRole('dialog').getByRole('img', { name: 'Портрет: Нияз' })).toBeVisible()
    await page.keyboard.press('Escape')
    await choose(page, /У него пять котов/, 'Проверить')
    await expect(page.locator('.visitor-window')).not.toHaveClass(/window-forehead/)
    await expect(page.getByRole('figure', { name: 'Схема берега' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Как связаны удочка и двадцать метров?' })).toBeVisible()
    await expect(page.locator('.choice')).toHaveCount(0)
    await expect(page.getByText(/Рыба утащила удочку/)).toHaveCount(0)
    await checkLayout()
    await expect(button(page, 'Открыть развязку')).toBeEnabled()
    await button(page, 'Открыть развязку').click()
    await expect(page.getByText(/Рыба утащила удочку/)).toBeVisible()
    await expect(page.getByRole('figure', { name: 'Схема берега' })).toHaveClass(/shore-resolved/)
    await capture('05-shore')
    await button(page, 'Назад').click()
    await expect(page.locator('.visitor-window')).toHaveClass(/window-forehead/)
    await button(page, 'К следующему этапу').click()
    await expect(page.getByText(/Рыба утащила удочку/)).toBeVisible()
    await button(page, 'К награждению').click()
    await expect(page.getByRole('heading', { name: 'Медаль «За волю к улову»' })).toBeVisible()
    await button(page, 'Поставить печать').click()
    await capture('06-niyaz-award')
    await button(page, 'Следующее дело · Марк').click()
    await checkLayout()
    await button(page, 'Вызвать гражданина').click()
    await expect(page.getByText(/ХАЛЕСИКИ/)).toBeVisible()
    const cockpit = page.locator('.cockpit-backdrop')
    await expect(cockpit).toBeVisible()
    await cockpit.evaluate(image => (image as HTMLImageElement).decode())
    await expect(page.getByRole('img', { name: 'Портрет: Марк' })).toBeVisible()
    await capture('10-mark-cockpit')
    await button(page, 'Паспорт').click()
    await expect(page.getByRole('dialog').getByRole('img', { name: 'Портрет: Марк' })).toBeVisible()
    await page.keyboard.press('Escape')
    await choose(page, /Scala — его любимый язык/, 'Проверить')
    await expect(page.getByRole('heading', { name: 'Что было на другом конце верёвочки?' })).toBeVisible()
    await expect(page.getByRole('figure', { name: 'Кадр с Дня города' })).toBeVisible()
    await expect(page.getByText(/седельный тягач/i)).toHaveCount(0)
    await expect(page.locator('.parade-truck')).toHaveCount(0)
    await capture('11-mark-parade')
    await expect(button(page, 'Открыть развязку')).toBeEnabled()
    await button(page, 'Открыть развязку').click()
    await expect(page.locator('.parade-truck')).toBeVisible()
    await expect(page.getByText(/Груз заявлен как ручная кладь/)).toBeVisible()
    await capture('12-mark-truck')
    await button(page, 'К награждению').click()
    await expect(page.getByRole('heading', { name: 'Медаль «Ручная кладь»' })).toBeVisible()
    await button(page, 'Поставить печать').click()
    await capture('13-mark-award')
    await button(page, 'Закрыть дело').click()
    await expect(page.getByRole('heading', { name: 'Проверка завершена' })).toBeVisible()
    await expect(page.getByText('Одобрено 3 из 3')).toBeVisible()
    await expect(page.locator('.citizen-avatar:visible')).toHaveCount(3)
    await capture('07-registry')
  })
}

test('при сбое загрузки портрета остаётся условный силуэт', async ({ page }) => {
  await page.route('**/sasha-portrait.png', route => route.abort())
  await startSasha(page)
  await button(page, 'Вызвать гражданина').click()
  await expect(page.getByRole('img', { name: 'Условный портрет' })).toBeVisible()
})

test('эффекты звучат после включения, выключение глушит аудиошину', async ({ page }) => {
  await page.addInitScript(() => {
    const tracker = { hits: 0, level: () => 0 }
    Object.assign(window, { audioTracker: tracker })
    const createGain = AudioContext.prototype.createGain
    const createOscillator = AudioContext.prototype.createOscillator
    let master: GainNode | undefined
    AudioContext.prototype.createGain = function () {
      const node = createGain.call(this)
      master ??= node
      tracker.level = () => master!.gain.value
      return node
    }
    AudioContext.prototype.createOscillator = function () {
      tracker.hits++
      return createOscillator.call(this)
    }
  })
  const tracker = () => page.evaluate(() => {
    const audio = Reflect.get(window, 'audioTracker') as { hits: number; level: () => number }
    return { hits: audio.hits, level: audio.level() }
  })
  await startSasha(page)
  await expect(button(page, 'Звук выключен')).toHaveAttribute('aria-pressed', 'false')
  await page.keyboard.press('m')
  await expect(button(page, 'Звук включён')).toHaveAttribute('aria-pressed', 'true')
  await button(page, 'Вызвать гражданина').click()
  expect((await tracker()).hits).toBeGreaterThan(0)
  await button(page, 'Звук включён').click()
  await expect.poll(async () => (await tracker()).level).toBeLessThan(0.02)
})
