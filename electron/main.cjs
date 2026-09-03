const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: 'TokenLens - JWT Studio & WebCrypto Key Inspector',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#0b0d17',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 14 },
    autoHideMenuBar: true,
  });

  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(path.join(__dirname, 'icon.png'));
  }

  const fs = require('fs');
  let indexPath = path.join(__dirname, '../dist/index.html');
  if (!fs.existsSync(indexPath)) {
    indexPath = path.join(__dirname, '../tokenlens-dist/index.html');
  }
  win.loadFile(indexPath);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
