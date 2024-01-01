const style = document.createElement('style')
style.textContent = `
#yt-categories {
  width: 100%;
  &.loading{
    opacity: .5;
    pointer-events: none;
  }
  * {
    font-family: "Roboto","Arial",sans-serif;
  }
  .hidden {
    display: none !important;
  }
  .flex {
    display: flex;
  }
  .grid {
    display: grid;
    gap: 16px;
  }
  .grid-cols-1 {
    grid-template-columns: repeat(1, 1fr);
  }
  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  .grid-cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
  .grid-cols-5 {
    grid-template-columns: repeat(5, 1fr);
  }
  .grid-cols-6 {
    grid-template-columns: repeat(6, 1fr);
  }
  .grid-cols-7 {
    grid-template-columns: repeat(7, 1fr);
  }
  .grid-cols-8 {
    grid-template-columns: repeat(8, 1fr);
  }
  .chips {
    display: flex;
    margin: 12px 0;
    gap: 12px;

    .chip {
      display: inline-flex;
      align-items: center;
      font-family: "Roboto","Arial",sans-serif;
      font-size: 1.4rem;
      line-height: 2rem;
      font-weight: 500;
      border-radius: 8px;
      height: 32px;
      min-width: 12px;
      background-color: var(--yt-spec-badge-chip-background);
      color: var(--yt-spec-text-primary);
      padding: 0 var(--ytd-margin-3x);
      transition: background-color .5s cubic-bezier(.05,0,0,1);
      cursor: pointer;
      border: none;
      outline: none;

      &:hover {
        background-color: var(--yt-spec-button-chip-background-hover);
      }

      &.active {
        background-color: var(--yt-spec-text-primary);
        color: var(--yt-spec-text-primary-inverse);
      }
    }
  }
  .category {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 24px;
    padding-top: 24px;

    > .title {
      font-size: 2rem;
      line-height: 2.8rem;
      font-weight: 700;
      color: var(--yt-spec-text-primary);
      padding: 20px 0;
    }

    .empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      font-size: 1.6rem;
      line-height: 2.2rem;
      font-weight: 400;
      color: var(--ytd-metadata-line-color,var(--yt-spec-text-secondary));
    }
  }
  .button {
    font-size: 14px;
    line-height: 36px;
    font-weight: 500;
    border-radius: 18px;
    color: #065fd4;
    padding: 0 16px;
    height: 36px;
    appearance: none;
    outline: none;
    border: none;
    background-color: transparent;
    cursor: pointer;
  }
  .button:hover {
    background-color: #def1ff;
  }
  .video {
    .flex {
      margin-top: 12px;
      gap: 12px;
    }
    img {
      object-fit: cover;
      width: 100%;
      aspect-ratio: 16/9;
      border-radius: 16px;
    }
    .avatar {
      object-fit: cover;
      border-radius: 100%;
      width: 36px;
      height: 36px;
      background: #eee;
    }
    a {
      text-decoration: none;
    }
    .title {
      color: var(--yt-spec-text-primary);
      font-size: 1.6rem;
      line-height: 2.2rem;
      font-weight: 500;
    }
    .channel {
      font-size: 1.4rem;
      line-height: 2rem;
      color: var(--ytd-metadata-line-color,var(--yt-spec-text-secondary));

      &:hover {
        color: var(--yt-spec-text-primary);
      }
    }
    .meta {
      font-size: 1.4rem;
      line-height: 2rem;
      font-weight: 400;
      color: var(--ytd-metadata-line-color,var(--yt-spec-text-secondary));
    }
    select {
      border-radius: 16px;
      padding: 4px 6px;
      border: 1px solid var(--ytd-metadata-line-color,var(--yt-spec-text-secondary));
      background: transparent;
      color: var(--ytd-metadata-line-color,var(--yt-spec-text-secondary));
      margin-top: 6px;

      option {
        background: transparent;
        color: var(--ytd-metadata-line-color,var(--yt-spec-text-secondary));
      }
    }
  }
}
html[dark] {
  #yt-categories {
    .button {
      color: #3ea6ff;

      &:hover {
        background-color: #263850;
      }
    }
  }
}
`

const UNCATEGORIZED = 'Uncategorized'

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

  // css
  $container.prepend(style)

  const titleCategories = document.createElement('div')
  titleCategories.classList.add('category')

  const chips = document.createElement('section')
  chips.classList.add('chips')
  titleCategories.appendChild(chips)

  const containerElement = document.createElement('div')
  titleCategories.appendChild(containerElement)

  const button = document.createElement('button')
  button.classList.add('button')
  button.textContent = 'Add category'
  button.addEventListener('click', () => {
    const name = window.prompt('Name new category')
    if (!name) return
    setSelectedCategory(name)
    createCategory({ name })
  })
  containerElement.appendChild(button)

  $container.appendChild(titleCategories)

  const selectedCategory = await getSelectedCategory()

  const categories = await getCategories()
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
  emptyDiv.innerHTML = channels.length > 0 ? 'No recent videos' : 'No channels'

  if (canDelete) {
    const button = document.createElement('button')
    button.classList.add('button')
    button.textContent = 'Remove'
    button.addEventListener('click', () => {
      if (!window.confirm(`Remove category ${name}?`)) return
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

  const categories = await getCategories()
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
  const categories = await getCategories()
  categories[name] = []
  setCategories(categories)
}

async function removeCategory (name) {
  const categories = await getCategories()
  delete categories[name]
  setCategories(categories)
}

async function setChannelToCategory ({ channel, category }) {
  const $container = document.querySelector('#yt-categories')
  $container.classList.add('loading')

  const categories = await getCategories()

  // remove from other categories
  Object.keys(categories).forEach((categoryName) => {
    categories[categoryName] = categories[categoryName].filter((item) => item !== channel)
  })

  if (!category) {
    setCategories(categories)
    return
  }

  categories[category] = categories[category] || []
  categories[category].push(channel)
  setCategories(categories)
}

async function getCategoryChannel (channel) {
  const categories = await getCategories()
  return Object.keys(categories).find((category) => {
    return categories[category].includes(channel)
  })
}

async function handleClickChip (sender) {
  if (!sender) return

  const $container = document.querySelector('#yt-categories')

  const sections = $container.querySelectorAll('[data-category-name]')
  sections.forEach((section) => {
    section.classList.add('hidden')
  })
  const chips = $container.querySelectorAll('.chip')
  chips.forEach((chip) => {
    chip.classList.remove('active')
  })

  const selectedCategory = await getSelectedCategory()
  if (selectedCategory === sender.textContent) {
    setSelectedCategory(null)
    $container.classList.remove('loading')
    return
  }

  const section = $container.querySelector(`[data-category-name="${sender.textContent}"]`)
  section.classList.toggle('hidden')
  sender.classList.toggle('active')

  setSelectedCategory(sender.textContent)

  $container.classList.remove('loading')
}

init()

// document.addEventListener('yt-navigate-start', init)

// STORAGE

globalThis.chrome.storage.onChanged.addListener((changes) => {
  if (changes.categories) init()
})

function setCategories (categories) {
  globalThis.chrome.storage.sync.set({ categories })
}

async function getCategories () {
  const storage = await globalThis.chrome.storage.sync.get('categories')
  return storage?.categories || {}
}

function setSelectedCategory (name) {
  globalThis.chrome.storage.local.set({ selectedCategory: name })
}

async function getSelectedCategory () {
  const storage = await globalThis.chrome.storage.local.get('selectedCategory')
  return storage?.selectedCategory
}
