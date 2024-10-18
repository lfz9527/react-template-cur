// 判断浏览器是否是否支持 appinstalled
export const supportAppInstalled = (): boolean => 'onappinstalled' in window

// 判断浏览器是否支持 beforeinstallprompt
export const supportBeforeInstallPrompt = (): boolean => 'onbeforeinstallprompt' in window
