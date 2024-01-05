document.addEventListener('yt-navigate-finish', async () => {
  console.log('yt-navigate-finish', window.location.pathname)

  renderSelectOnChannel()
})

renderSelectOnChannel()

function renderSelectOnChannel () {
  document.querySelectorAll('ytd-browse[page-subtype=channels]').forEach(async ($channel) => {
    const channel = $channel.querySelector('#channel-handle')?.textContent
    if (!channel) return

    $channel.querySelectorAll('.yt-categories-select').forEach((elem) => {
      elem.remove()
    })

    const select = await getSelect({ channel })

    $channel.querySelector('#inner-header-container #buttons')?.appendChild(select)
  })

  if (!window.location.pathname.startsWith('/feed/channels')) return

  document.querySelectorAll('ytd-browse ytd-channel-renderer').forEach(async ($channel) => {
    const channel = $channel.querySelector('#subscribers')?.textContent
    if (!channel) return

    $channel.querySelectorAll('.yt-categories-select').forEach((elem) => {
      elem.remove()
    })

    const select = await getSelect({ channel })

    $channel.querySelector('#buttons')?.appendChild(select)
  })
}

async function getSelect ({ channel }) {
  const category = await globalThis.getCategoryChannel(channel)

  const select = document.createElement('select')
  select.classList.add('yt-categories-select')
  select.addEventListener('change', async (evt) => {
    const category = evt.target.value
    await globalThis.setChannelToCategory({ channel, category })
  })

  const categories = await globalThis.getCategories()

  const option = document.createElement('option')
  option.value = ''
  option.textContent = globalThis.chrome.i18n.getMessage('uncategorized')
  option.selected = !category
  select.appendChild(option)

  if (categories) {
    Object.keys(categories).forEach((name) => {
      const option = document.createElement('option')
      option.value = name
      option.textContent = name
      option.selected = category === name
      select.appendChild(option)
    })
  }

  return select
}
