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
