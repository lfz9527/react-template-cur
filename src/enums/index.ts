export enum PwaEvent {
    'failPrompt', // 提示弹出失败
    'showPrompt', // 弹出自定义提示
    'showInstallPrompt', // 弹出安装提示
    'cancelInstall', // 取消安装
    'successInstall', // 安装成功
    'openFromPwa'// 从PWA打开
}
