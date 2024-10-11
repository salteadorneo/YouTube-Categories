globalThis.categories = null

globalThis.setCategories = async (categories) => {
  await globalThis.chrome.storage.sync.set({ categories })
}

globalThis.getCategories = async () => {
  if (globalThis.categories) { // cache
    return globalThis.categories
  }
  const storage = await globalThis.chrome.storage.sync.get('categories')
  globalThis.categories = storage?.categories || {} // cache
  return storage?.categories || {}
}

globalThis.getChannelsCategory = async (category) => {
  const categories = await globalThis.getCategories()
  return categories[category] || []
}

globalThis.setSelectedCategory = async (name) => {
  await globalThis.chrome.storage.local.set({ selectedCategory: name })
}

globalThis.getSelectedCategory = async () => {
  const storage = await globalThis.chrome.storage.local.get('selectedCategory')
  return storage?.selectedCategory
}
