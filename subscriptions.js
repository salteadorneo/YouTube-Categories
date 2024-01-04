async function createHeader ($page) {
  $page.querySelectorAll('#header .yt-categories-header').forEach((elem) => {
    elem.remove()
  })

  const containerHeader = document.createElement('div')
  containerHeader.classList.add('yt-categories-header')

  const chips = document.createElement('section')
  chips.classList.add('chips')

  const categories = await globalThis.getCategories()
  const selectedCategory = await globalThis.getSelectedCategory()
  if (categories) {
    Object.keys(categories).forEach((name) => {
      const newChip = newChipButton(name)
      chips.appendChild(newChip)
      if (name === selectedCategory) {
        newChip.click()
      }
    })
  }

  containerHeader.appendChild(chips)

  const containerElement = document.createElement('div')
  containerHeader.appendChild(containerElement)

  const button = document.createElement('button')
  button.classList.add('yt-categories-button')
  button.textContent = globalThis.chrome.i18n.getMessage('add_category')
  button.addEventListener('click', () => {
    const name = window.prompt(globalThis.chrome.i18n.getMessage('add_category'))
    if (!name) return
    globalThis.createCategory({ name })
  })
  containerElement.appendChild(button)

  $page.querySelector('#header').appendChild(containerHeader)
}

async function createVideosContainer ($page) {
  const exists = $page.querySelector('#yt-categories-videos')
  if (exists) exists.remove()

  const containerVideos = document.createElement('section')
  containerVideos.id = 'yt-categories-videos'

  const itemsPerRow = $page.querySelector('ytd-rich-grid-row > div')?.childElementCount
  containerVideos.classList.value = `grid-cols-${itemsPerRow || 4}`

  let $contents = $page.querySelector('#contents')
  while (!$contents) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    $contents = $page.querySelector('#contents')
  }
  $contents.parentNode.insertBefore(containerVideos, $contents)
}

function newChipButton (name) {
  const chipButton = document.createElement('button')
  chipButton.classList.add('chip')
  chipButton.textContent = name
  chipButton.addEventListener('click', handleClickChip)
  return chipButton
}

async function handleClickChip (evt) {
  const sender = evt.target

  const chips = document.querySelectorAll('.chip')
  chips.forEach((chip) => {
    chip.classList.remove('active')
  })

  sender.classList.toggle('active')

  globalThis.setSelectedCategory(sender.textContent)
}

globalThis.chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectedCategory) {
    filterVideos()
  }
})

document.addEventListener('yt-navigate-finish', async () => {
  if (window.location.pathname === '/feed/subscriptions') {
    init()
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname === '/feed/subscriptions') {
    init()
  }
})

async function init () {
  let $page = document.querySelector('ytd-browse[page-subtype=subscriptions]')

  while (!$page) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    $page = document.querySelector('ytd-browse[page-subtype=subscriptions]')
  }

  await createHeader($page)

  await createVideosContainer($page)

  await filterVideos()
}

window.addEventListener('resize', () => {
  setTimeout(() => {
    const $containerVideos = document.querySelector('#yt-categories-videos')
    const itemsPerRow = document.querySelector('ytd-rich-grid-row > div')?.childElementCount
    $containerVideos.classList.value = `grid-cols-${itemsPerRow || 4}`
  }, 300)
})

async function filterVideos () {
  const selectedCategory = await globalThis.getSelectedCategory()

  const $containerVideos = document.querySelector('#yt-categories-videos')
  $containerVideos.innerHTML = ''

  const channels = await globalThis.getChannelsCategory(selectedCategory)

  if (channels.length === 0 && selectedCategory) {
    const $noVideos = document.createElement('p')
    $noVideos.textContent = globalThis.chrome.i18n.getMessage('no_channels')
    $noVideos.classList.add('empty')
    $containerVideos.appendChild($noVideos)
  }

  const $videos = document.querySelectorAll('ytd-rich-item-renderer')
  if ($videos.length) {
    const videosArray = [...$videos]
    videosArray.forEach(async (video) => {
      const channel = video.querySelector('ytd-channel-name a')?.href.split('/').pop()
      if (!channel) return

      const $videoElement = await extractInfo(video)

      const category = await globalThis.getCategoryChannel(channel)

      if (channels.length > 0 && selectedCategory && category === selectedCategory) {
        $containerVideos.appendChild($videoElement)
      }
    })
  }
}

async function extractInfo (video) {
  const link = video.querySelector('#video-title-link')?.href
  const id = link.match(/v=(.+?)(?:&|$)/)[1]
  const title = video.querySelector('#video-title')?.textContent
  const image = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  const channel = video.querySelector('ytd-channel-name a')?.textContent
  const channelLink = video.querySelector('ytd-channel-name a')?.href
  const avatar = video.querySelector('#avatar-link img')?.src
  const metas = video.querySelectorAll('#metadata-line span')

  const videoElement = document.createElement('div')
  videoElement.classList.add('video')

  const anchor = document.createElement('a')
  anchor.href = link

  const imageElement = document.createElement('img')
  imageElement.src = image
  imageElement.alt = title

  anchor.appendChild(imageElement)
  videoElement.appendChild(anchor)

  const flexElement = document.createElement('div')
  flexElement.classList.add('flex')
  videoElement.appendChild(flexElement)

  const containerImageElement = document.createElement('div')
  flexElement.appendChild(containerImageElement)

  const avatarElement = document.createElement('img')
  avatarElement.src = avatar
  avatarElement.classList.add('avatar')
  containerImageElement.appendChild(avatarElement)

  const containerElement = document.createElement('div')
  flexElement.appendChild(containerElement)

  const titleElement = document.createElement('p')
  const titleLinkElement = document.createElement('a')
  titleLinkElement.href = link
  titleElement.textContent = title
  titleElement.classList.add('title')
  titleLinkElement.appendChild(titleElement)
  containerElement.appendChild(titleLinkElement)

  const channelElement = document.createElement('p')
  const channelLinkElement = document.createElement('a')
  channelLinkElement.href = channelLink
  channelElement.textContent = channel
  channelElement.classList.add('channel')
  channelLinkElement.appendChild(channelElement)
  containerElement.appendChild(channelLinkElement)

  const metaElement = document.createElement('p')
  metaElement.textContent = [...metas].map((meta) => meta.textContent).join(' • ')
  metaElement.classList.add('meta')
  containerElement.appendChild(metaElement)

  return videoElement
}
