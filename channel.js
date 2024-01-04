document.addEventListener('yt-navigate-finish', async () => {
  console.log('yt-navigate-finish', window.location.pathname)

  printSelectOnChannel()
})

printSelectOnChannel()

function printSelectOnChannel () {
  document.querySelectorAll('ytd-browse[page-subtype=channels]').forEach(async ($page) => {
    const channelName = $page.querySelector('#channel-handle')?.textContent
    if (!channelName) return

    $page.querySelectorAll('.yt-categories-select').forEach((elem) => {
      elem.remove()
    })

    const category = await globalThis.getCategoryChannel(channelName)

    const $select = document.createElement('select')
    $select.classList.add('yt-categories-select')
    $select.addEventListener('change', async (evt) => {
      const category = evt.target.value
      await globalThis.setChannelToCategory({ channel: channelName, category })
    })

    const categories = await globalThis.getCategories()
    Object.keys(categories).forEach((name) => {
      const $option = document.createElement('option')
      $option.value = name
      $option.textContent = name
      if (category === name) {
        $option.selected = true
      }
      $select.appendChild($option)
    })

    const $option = document.createElement('option')
    $option.value = ''
    $option.textContent = globalThis.chrome.i18n.getMessage('uncategorized')
    if (!category) {
      $option.selected = true
    }
    $select.appendChild($option)

    $page.querySelector('#inner-header-container #buttons')?.appendChild($select)
  })
}
