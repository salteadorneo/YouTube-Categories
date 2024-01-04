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
