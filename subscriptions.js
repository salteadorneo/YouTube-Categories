const UNCATEGORIZED = globalThis.chrome.i18n.getMessage('uncategorized')

let interval
async function init () {
  let $contents = document.querySelector('#contents')

  while (!$contents) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    $contents = document.querySelector('#contents')
  }

  let $container = document.querySelector('#yt-categories')
  if (!$container) {
    $container = document.createElement('section')
    $container.id = 'yt-categories'
    // add before content
    $contents.parentNode.insertBefore($container, $contents)
  }
  $container.innerHTML = ''

  const titleCategories = document.createElement('div')
  titleCategories.classList.add('category')

  const chips = document.createElement('section')
  chips.classList.add('chips')
  titleCategories.appendChild(chips)

  const containerElement = document.createElement('div')
  titleCategories.appendChild(containerElement)

  const button = document.createElement('button')
  button.classList.add('button')
  button.textContent = globalThis.chrome.i18n.getMessage('add_category')
  button.addEventListener('click', () => {
    const name = window.prompt(globalThis.chrome.i18n.getMessage('add_category'))
    if (!name) return
    createCategory({ name })
  })
  containerElement.appendChild(button)

  $container.appendChild(titleCategories)

  const selectedCategory = await globalThis.getSelectedCategory()

  const categories = await globalThis.getCategories()
  if (categories) {
    Object.keys(categories).forEach((name) => {
      createCategorySection({ name, channels: categories[name], canDelete: true })

      const chipButton = document.createElement('button')
      chipButton.classList.add('chip')
      chipButton.textContent = name
      chipButton.addEventListener('click', () => {
        handleClickChip(chipButton)
      })
      chips.appendChild(chipButton)

      if (name === selectedCategory) {
        handleClickChip(chipButton)
      }
    })
  }
  createCategorySection({ name: UNCATEGORIZED, canDelete: false })

  const chipButton = document.createElement('button')
  chipButton.classList.add('chip')
  chipButton.textContent = UNCATEGORIZED
  chipButton.addEventListener('click', () => {
    handleClickChip(chipButton)
  })
  chips.appendChild(chipButton)

  if (UNCATEGORIZED === selectedCategory) {
    handleClickChip(chipButton)
  }

  if (interval) clearInterval(interval)
  interval = setInterval(async () => {
    const videos = document.querySelectorAll('ytd-rich-item-renderer')
    if (videos.length) {
      clearInterval(interval)

      const contentElement = document.querySelector('#contents')
      const observer = new window.MutationObserver(init)
      observer.observe(contentElement, { childList: true })

      const videosArray = [...videos]
      videosArray.forEach(async (video) => {
        const channelName = video.querySelector('ytd-channel-name a')?.textContent
        if (!channelName) return

        const videoElement = await extractInfo(video)

        const category = await getCategoryChannel(channelName)

        const section = category
          ? $container.querySelector(`[data-category-name="${category}"]`)
          : $container.querySelector(`[data-category-name="${UNCATEGORIZED}"]`)

        section?.querySelector('.empty').classList.add('hidden')

        section?.querySelector('div').appendChild(videoElement)

        $container.classList.remove('loading')
      })
    }
  }, 1000)
}

function createCategorySection ({ name, channels = [], canDelete }) {
  const $container = document.querySelector('#yt-categories')

  if ($container.querySelector(`[data-category-name="${name}"]`)) return

  const section = document.createElement('section')
  section.dataset.categoryName = name
  section.classList.add('category', 'hidden')

  const emptyDiv = document.createElement('p')
  emptyDiv.classList.add('empty')
  emptyDiv.innerHTML = channels.length > 0
    ? globalThis.chrome.i18n.getMessage('no_recent_videos')
    : globalThis.chrome.i18n.getMessage('no_channels')

  if (canDelete) {
    const button = document.createElement('button')
    button.classList.add('button')
    button.textContent = globalThis.chrome.i18n.getMessage('delete_category')
    button.addEventListener('click', () => {
      if (!window.confirm(globalThis.chrome.i18n.getMessage('are_you_sure'))) return
      removeCategory(name)
    })
    emptyDiv.appendChild(button)
  }

  section.appendChild(emptyDiv)

  const itemsPerRow = document.querySelector('ytd-rich-grid-row > div')?.childElementCount

  const div = document.createElement('div')
  div.classList.add('grid', `grid-cols-${itemsPerRow || 4}`)
  section.appendChild(div)

  $container.append(section)
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

  const select = document.createElement('select')

  const option = document.createElement('option')
  select.appendChild(option)

  const categories = await globalThis.getCategories()
  if (categories) {
    Object.keys(categories).forEach((category) => {
      const option = document.createElement('option')
      option.value = category
      option.textContent = category
      select.appendChild(option)
    })
    // get category
    const category = await getCategoryChannel(channel)
    select.value = category || ''
  }

  select.addEventListener('change', (event) => {
    const category = event.target.value
    setChannelToCategory({ channel, category })
  })
  containerElement.appendChild(select)

  return videoElement
}

async function createCategory ({ name }) {
  const categories = await globalThis.getCategories()
  categories[name] = []
  await globalThis.setSelectedCategory(name)
  await globalThis.setCategories(categories)
}

async function removeCategory (name) {
  const categories = await globalThis.getCategories()
  delete categories[name]
  globalThis.setCategories(categories)
}

async function setChannelToCategory ({ channel, category }) {
  const $container = document.querySelector('#yt-categories')
  $container.classList.add('loading')

  const categories = await globalThis.getCategories()

  // remove from other categories
  Object.keys(categories).forEach((categoryName) => {
    categories[categoryName] = categories[categoryName].filter((item) => item !== channel)
  })

  if (!category) {
    globalThis.setCategories(categories)
    return
  }

  categories[category] = categories[category] || []
  categories[category].push(channel)
  globalThis.setCategories(categories)
}

async function getCategoryChannel (channel) {
  const categories = await globalThis.getCategories()
  return Object.keys(categories).find((category) => {
    return categories[category].includes(channel)
  })
}

async function handleClickChip (sender) {
  if (!sender) return

  const isActive = sender.classList.contains('active')

  const $container = document.querySelector('#yt-categories')

  const sections = $container.querySelectorAll('[data-category-name]')
  sections.forEach((section) => {
    section.classList.add('hidden')
  })
  const chips = $container.querySelectorAll('.chip')
  chips.forEach((chip) => {
    chip.classList.remove('active')
  })

  const selectedCategory = await globalThis.getSelectedCategory()
  if (selectedCategory === sender.textContent && isActive) {
    globalThis.setSelectedCategory(null)
    $container.classList.remove('loading')
    return
  }

  const section = $container.querySelector(`[data-category-name="${sender.textContent}"]`)
  section.classList.toggle('hidden')
  sender.classList.toggle('active')

  globalThis.setSelectedCategory(sender.textContent)

  $container.classList.remove('loading')
}

// document.addEventListener('yt-navigate-start', init)

globalThis.chrome.storage.onChanged.addListener((changes) => {
  if (changes.categories) init()
})

init()
