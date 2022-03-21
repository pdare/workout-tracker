const { app, BrowserWindow, Tray, nativeImage, protocol } = require("electron");
const path = require("path");
const url = require("url");
const Store = require('electron-store')


let tray, window

//app.dock.hide()

function createWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        show: true,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    const appURL = app.isPackaged
        ? url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true,
        })
        : "http://localhost:3000";
    window.loadURL('http://localhost:3000');

    /**if (!app.isPackaged) {
        window.webContents.openDevTools();
    }**/
}



const createTray = () => {
    const icon = path.join(__dirname, 'icon.png')
    const nImage = nativeImage.createFromPath(icon)

    tray = new Tray(nImage)
    tray.on('click', (event) => toggleWindow())
}

const toggleWindow = () => {
    window.isVisible() ? window.hide() : showWindow()
}

const showWindow = () => {
    const position = windowPosition()
    window.setPosition(position.x, position.y)
    window.show()
}

const windowPosition = () => {
    const windowBounds = window.getBounds()
    const trayBounds = tray.getBounds()

    const x = Math.round(trayBounds.x + (trayBounds.width/2) - (windowBounds.width / 2))
    const y = Math.round(trayBounds.y + trayBounds.height)

    return {x, y}
}

function setupLocalFilesNormalizerProxy() {
    protocol.registerHttpProtocol(
        "file",
        (request, callback) => {
            const url = request.url.substring(8);
            callback({ path: path.normalize('${__dirname}/${url}')});
        },
        (error) => {
            if (error) console.error("Failed to register protocol");
        }
    );
}

app.whenReady().then(()  => {
    createTray();
    createWindow();
    setupLocalFilesNormalizerProxy();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", function () {
    if (process.platform != "darwin") {
        app.quit();
    }
});

const allowedNavigationDestinations = "https://my-electron-app.com";
app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (!allowedNavigationDestinations.includes(parsed.origin)) {
            event.preventDefault();
        }
    });
});

const store = new Store()
store.set('userSettings.theme', 'dark')
console.log('theme:', store.get('userSettings.theme'))
console.log(app.getPath('userData'))