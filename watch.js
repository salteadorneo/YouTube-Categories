document.addEventListener('yt-navigate-finish', async () => {
  if (window.location.pathname === '/watch') {
    setTimeout(() => {
      renderSelectOnWatch()
    }, 300)
  }
})

renderSelectOnWatch()

function renderSelectOnWatch () {
  document.querySelectorAll('.yt-categories-select').forEach((elem) => {
    elem.remove()
  })

  document.querySelectorAll('ytd-watch-flexy').forEach(async ($watch) => {
    let channel = $watch.querySelector('.ytd-channel-name a')
    while (!channel) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      channel = $watch.querySelector('.ytd-channel-name a')
    }
    channel = channel.href.split('/').pop()
    if (!channel) return

    const buttonSubscribe = $watch.querySelector('ytd-subscribe-button-renderer[subscribed]')
    if (!buttonSubscribe) return

    const select = await globalThis.getSelect({ channel })

    $watch.querySelector('#owner')?.appendChild(select)
  })
}
