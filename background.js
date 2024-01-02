globalThis.chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    const DEFAULT_CATEGORIES = globalThis.chrome.i18n.getMessage('default_categories').split(',')
    globalThis.chrome.storage.sync.set({
      categories: DEFAULT_CATEGORIES.map((name) => ({ [name]: [] })).reduce((acc, cur) => ({ ...acc, ...cur }), {})
    })
  }
})
