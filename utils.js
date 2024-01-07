globalThis.createCategory = async ({ name }) => {
  const categories = await globalThis.getCategories()
  categories[name] = []
  await globalThis.setSelectedCategory(name)
  await globalThis.setCategories(categories)
}

globalThis.removeCategory = async (name) => {
  const categories = await globalThis.getCategories()
  delete categories[name]
  await globalThis.setSelectedCategory(null)
  await globalThis.setCategories(categories)
}

globalThis.getCategoryChannel = async (channel) => {
  const categories = await globalThis.getCategories()
  return Object.keys(categories).find((category) => {
    return categories[category].includes(channel)
  })
}

globalThis.setChannelToCategory = async ({ channel, category }) => {
  const categories = await globalThis.getCategories()

  if (!categories) return

  // remove from other categories
  Object.keys(categories).forEach((categoryName) => {
    categories[categoryName] = categories[categoryName].filter((item) => item !== channel)
  })

  if (!category) {
    await globalThis.setCategories(categories)
    return
  }

  categories[category] = categories[category] || []
  categories[category].push(channel)
  await globalThis.setCategories(categories)
}

globalThis.getSelect = async ({ channel }) => {
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
