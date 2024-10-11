async function createHeader ($page) {
  $page.querySelectorAll('#header .yt-categories-header').forEach((elem) => {
    elem.remove()
  })

  const containerHeader = document.createElement('div')
  containerHeader.classList.add('yt-categories-header')
  $page.querySelector('#header').appendChild(containerHeader)

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

  // chip for create new category
  const newChip = document.createElement('button')
  newChip.classList.add('chip', 'new_category')

  newChip.textContent = '+'
  newChip.addEventListener('click', () => {
    const name = window.prompt(globalThis.chrome.i18n.getMessage('add_category'))
    if (!name) return
    globalThis.createCategory({ name })
  })
  chips.appendChild(newChip)

  containerHeader.appendChild(chips)

  const containerElement = document.createElement('div')
  containerHeader.appendChild(containerElement)
}

async function createVideosContainer ($page) {
  const exists = $page.querySelector('#yt-categories-videos')
  if (exists) exists.remove()

  const containerVideos = document.createElement('section')
  containerVideos.id = 'yt-categories-videos'

  const itemsPerRow = $page.querySelector('ytd-rich-grid-row > div')?.childElementCount
  containerVideos.classList.value = `grid grid-cols-${itemsPerRow || 4}`

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
  if (changes.categories) {
    if (Object.keys(changes.categories.newValue).length !== Object.keys(changes.categories.oldValue).length) {
      init()
    }
  }
})

init()

document.addEventListener('yt-navigate-finish', () => {
  if (window.location.pathname === '/feed/subscriptions') {
    init()
  }
})

globalThis.videosLength = 0

async function init () {
  let $page = document.querySelector('ytd-browse[page-subtype=subscriptions]')

  while (!$page) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    $page = document.querySelector('ytd-browse[page-subtype=subscriptions]')
  }

  await createHeader($page)

  await createVideosContainer($page)

  await filterVideos()

  const observer = new globalThis.MutationObserver(() => {
    const $videos = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer')

    if ($videos.length === globalThis.videosLength) return
    globalThis.videosLength = $videos.length

    filterVideos()
  })
  observer.observe(document.querySelector('#contents'), { childList: true, subtree: false })
}

window.addEventListener('resize', () => {
  setTimeout(() => {
    const $containerVideos = document.querySelector('#yt-categories-videos')
    if (!$containerVideos) return
    const itemsPerRow = document.querySelector('ytd-rich-grid-row > div')?.childElementCount
    $containerVideos.classList.value = `grid grid-cols-${itemsPerRow || 4}`
  }, 300)
})

async function filterVideos () {
  const selectedCategory = await globalThis.getSelectedCategory()

  const $containerVideos = document.querySelector('#yt-categories-videos')
  $containerVideos.innerHTML = ''

  if (!selectedCategory) return

  const itemsPerRow = document.querySelector('ytd-rich-grid-row > div')?.childElementCount
  $containerVideos.classList.value = `grid grid-cols-${itemsPerRow || 4}`

  const channels = await globalThis.getChannelsCategory(selectedCategory)

  if (channels.length === 0 && selectedCategory) {
    $containerVideos.classList.value = ''
    const exists = $containerVideos.querySelector('.empty')
    if (!exists) {
      $containerVideos.appendChild(emptyHtml())
    }
  }

  const $videos = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer')
  if ($videos.length) {
    const videosArray = [...$videos]
    videosArray.forEach(async (video) => {
      const channel = video.querySelector('ytd-channel-name a')?.href.split('/').pop()
      if (!channel) return

      const $videoElement = await extractInfo(video)

      const category = await globalThis.getCategoryChannel(channel)

      if (channels.length > 0 && selectedCategory && category === selectedCategory) {
        const id = $videoElement.dataset.id
        const exists = $containerVideos.querySelector(`.video[data-id=v${id}]`)
        if (!exists) {
          $containerVideos.appendChild($videoElement)
        }
      }
    })
    setTimeout(() => {
      if ($containerVideos.querySelectorAll('.video').length === 0) {
        const exists = $containerVideos.querySelector('.empty')
        if (!exists) {
          $containerVideos.classList.value = ''
          $containerVideos.appendChild(noVideos())
        }
      }
    }, 100)
  }
}

function emptyHtml () {
  const container = document.createElement('div')
  container.classList.add('empty')

  const p = document.createElement('p')
  p.textContent = globalThis.chrome.i18n.getMessage('no_channels')
  container.appendChild(p)

  const manageButton = document.createElement('a')
  manageButton.href = 'https://www.youtube.com/feed/channels'
  manageButton.classList.add('yt-categories-button')
  manageButton.textContent = globalThis.chrome.i18n.getMessage('manage')
  container.appendChild(manageButton)

  container.appendChild(removeButton())

  return container
}

function noVideos () {
  const container = document.createElement('div')
  container.classList.add('empty')

  const p = document.createElement('p')
  p.textContent = globalThis.chrome.i18n.getMessage('novideos')
  container.appendChild(p)

  container.appendChild(removeButton())

  return container
}

function removeButton () {
  const removeButton = document.createElement('button')
  removeButton.classList.add('yt-categories-button')
  removeButton.textContent = globalThis.chrome.i18n.getMessage('delete_category')
  removeButton.addEventListener('click', async () => {
    const selectedCategory = await globalThis.getSelectedCategory()
    const confirm = window.confirm(globalThis.chrome.i18n.getMessage('are_you_sure', [selectedCategory]))
    if (!confirm) return
    globalThis.removeCategory(selectedCategory)
  })
  return removeButton
}

async function extractInfo (video) {
  const link = video.querySelector('a')?.href
  const id = link.match(/v=(.+?)(?:&|$)/)?.[1]
  const title = video.querySelector('#video-title')?.textContent
  const image = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  const channel = video.querySelector('ytd-channel-name a')?.textContent
  const channelLink = video.querySelector('ytd-channel-name a')?.href
  const avatar = video.querySelector('yt-avatar-shape img')?.src
  const metas = video.querySelectorAll('#metadata-line span')

  const videoElement = document.createElement('div')
  videoElement.classList.add('video')
  videoElement.dataset.id = `v${id}`
  videoElement.dataset.channel = channel

  videoElement.style.width = document.querySelector('ytd-rich-item-renderer')?.offsetWidth + 'px'

  const anchor = document.createElement('a')
  anchor.href = link

  const imageElement = document.createElement('img')
  imageElement.src = image
  imageElement.alt = title
  imageElement.loading = 'lazy'

  anchor.appendChild(imageElement)
  videoElement.appendChild(anchor)

  const flexElement = document.createElement('div')
  flexElement.classList.add('flex')
  videoElement.appendChild(flexElement)

  const containerImageElement = document.createElement('div')
  flexElement.appendChild(containerImageElement)

  const avatarElement = document.createElement('img')
  const avatarLinkElement = document.createElement('a')
  avatarLinkElement.href = channelLink
  avatarElement.src = avatar
  avatarElement.classList.add('avatar')
  avatarElement.loading = 'lazy'
  avatarElement.onerror = () => {
    avatarElement.src = 'https://placehold.co/36x36?text=YT'
  }
  avatarLinkElement.appendChild(avatarElement)
  containerImageElement.appendChild(avatarLinkElement)

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
