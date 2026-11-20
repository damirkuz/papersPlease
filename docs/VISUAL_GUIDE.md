# Визуальный стиль

КПП, очередь, силуэт, герб, печать и медали нарисованы для игры. Основная палитра — тёмная олива, тёплая бумага, сургуч и зелёные чернила. [tokens.css](../src/styles/tokens.css) задаёт цвета, шрифты, размеры и время эффектов. [Декорации](../public/assets/decorations/) лежат отдельно от портретов граждан.

Для показа рассчитаны 1920×1080 и 1366×768. На узких экранах панели перестраиваются вертикально. Прозрачные спрайты выровнены по низу окна инспектора, на паспортном бланке они отображаются целиком. Системное уменьшение движения и переключатель ведущего сокращают движение заслонки, удочки и печати. Звонок, перелистывание, плеск, удар печати и мелодия награждения синтезируются локально через Web Audio. Клавиша **M** управляет общей громкостью.

## Снимки из Chrome

| Сцена | 1920×1080 | 1366×768 |
| --- | --- | --- |
| Вступление | [PNG](screenshots/1920-01-intro.png) | [PNG](screenshots/1366-01-intro.png) |
| Проверка с открытым паспортом | [PNG](screenshots/1920-02-documents.png) | [PNG](screenshots/1366-02-documents.png) |
| Завязка с двумя аэропортами | [PNG](screenshots/1920-03-airports.png) | [PNG](screenshots/1366-03-airports.png) |
| Маршрут Саши после раскрытия | [PNG](screenshots/1920-08-flight-reveal.png) | [PNG](screenshots/1366-08-flight-reveal.png) |
| Награда Саши | [PNG](screenshots/1920-04-award.png) | [PNG](screenshots/1366-04-award.png) |
| Раскрытие истории Нияза | [PNG](screenshots/1920-05-shore.png) | [PNG](screenshots/1366-05-shore.png) |
| Кадр Нияза на проверке документов | [PNG](screenshots/1920-09-niyaz-window.png) | [PNG](screenshots/1366-09-niyaz-window.png) |
| Награда Нияза | [PNG](screenshots/1920-06-niyaz-award.png) | [PNG](screenshots/1366-06-niyaz-award.png) |
| Марк на связи из рубки | [PNG](screenshots/1920-10-mark-cockpit.png) | [PNG](screenshots/1366-10-mark-cockpit.png) |
| Кадр с верёвочкой | [PNG](screenshots/1920-11-mark-parade.png) | [PNG](screenshots/1366-11-mark-parade.png) |
| Тягач после раскрытия | [PNG](screenshots/1920-12-mark-truck.png) | [PNG](screenshots/1366-12-mark-truck.png) |
| Награда Марка | [PNG](screenshots/1920-13-mark-award.png) | [PNG](screenshots/1366-13-mark-award.png) |
| Реестр после трёх дел | [PNG](screenshots/1920-07-registry.png) | [PNG](screenshots/1366-07-registry.png) |
