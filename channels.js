document.addEventListener('yt-navigate-finish', async () => {
  renderSelectOnChannel()
})

renderSelectOnChannel()

function renderSelectOnChannel () {
  document.querySelectorAll('ytd-browse[page-subtype=channels]').forEach(async ($channel) => {
    const channel = window.location.pathname.split('/').pop()
    if (!channel) return

    $channel.querySelectorAll('.yt-categories-select').forEach((elem) => {
      elem.remove()
    })

    const select = await globalThis.getSelect({ channel })

    $channel.querySelector('yt-flexible-actions-view-model')?.appendChild(select)
  })

  if (!window.location.pathname.startsWith('/feed/channels')) return

  document.querySelectorAll('ytd-browse ytd-channel-renderer').forEach(async ($channel) => {
    const channel = $channel.querySelector('#subscribers')?.textContent
    if (!channel) return

    $channel.querySelectorAll('.yt-categories-select').forEach((elem) => {
      elem.remove()
    })

    const select = await globalThis.getSelect({ channel })

    $channel.querySelector('#buttons')?.appendChild(select)
  })
}
