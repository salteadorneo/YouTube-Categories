globalThis.createSelectCategory = async () => {
  const select = document.createElement('select')

  const option = document.createElement('option')
  option.value = ''
  option.textContent = globalThis.chrome.i18n.getMessage('uncategorized')
  select.appendChild(option)

  const categories = await globalThis.getCategories()
  if (categories) {
    Object.keys(categories).forEach((category) => {
      const option = document.createElement('option')
      option.value = category
      option.textContent = category
      select.appendChild(option)
    })
  }

  return select
}

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
  const $container = document.querySelector('#yt-categories')
  $container.classList.add('loading')

  const categories = await globalThis.getCategories()

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
