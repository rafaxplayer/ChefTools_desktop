const electron = require('electron');
const { app, BrowserWindow, dialog,ipcMain} = electron;
const path = require('path');
const url = require('url');

let mainWindow;

let winPage;

let modalWin;

let db;

const makeSingleInstance = function () {

    const gotTheLock = app.requestSingleInstanceLock()

    if (!gotTheLock) {
        app.quit()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore()
                mainWindow.focus()
            }
        })
    }

}


const initialize = function () {

    makeSingleInstance();

    function createWindow() {
        const { screen } = electron;
        const size = screen.getPrimaryDisplay().size
        mainWindow = new BrowserWindow({
            width: size.width,
            height: size.height,
            frame: false,
            'minHeight': 500,
            'minWidth': 500,
            
            icon: path.join(__dirname, "/assets/img/logo.png")
        });

        mainWindow.on('closed', function(){
            win = null
        })

        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }))

        db = require('./database/database.js');

        mainWindow.webContents.on("did-finish-load", () => mainWindow.webContents.openDevTools())

    }

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    ipcMain.on('add-or-updated',function(event,args){
        
        if(winPage)
            winPage.webContents.send('reload',[]);
        
    })
          

    app.on('ready', createWindow);


}

exports.closeWindow = (type) => {
    let w = winType(type);
    if (!(w == mainWindow)) {
        w.close();
        return;
    }
    const dialogOptions = { type: 'warning', buttons: ['Salir', 'Cancel'], title: 'Chef Tools', message: '¿Seguro quieres salir de Chef Tools?' }
    dialog.showMessageBox(dialogOptions, i => {
        if (i == 0) {
            mainWindow.close();
        }
    })
}

exports.maxsimizeWindow = (type) => {
    let w = winType(type);
    if (!(w == mainWindow)) {
        if (w.isMaximized()) {
            w.unmaximize();
            return;
        }
        w.maximize();
        return;
    }
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
        return;
    }
    mainWindow.maximize();
}

exports.minimizeWindow = (type) => {
    let w = winType(type);

    if (!(w == mainWindow)) {
        w.minimize();
        return;
    }
    mainWindow.minimize();
}

const winType = function (type) {

    switch (type) {
        case 0:
            return mainWindow;
        case 1:
            return winPage;
        case 2:
            return modalWin;
        default:
            return mainWindow;

    }
}

exports.loadPage = (curfile) => {
    winPage = new BrowserWindow({
        width: 1024, height: 800,
        'minHeight': 500,
        'minWidth': 500,
        parent: mainWindow,
        modal: true,
        frame: false
    });

    winPage.on('closed', () => {
        winPage = null
    })

    winPage.loadURL(path.join('file://', __dirname, curfile));

    winPage.webContents.on('did-finish-load', () => winPage.webContents.openDevTools());

}

exports.loadModalWindow = (curpath, data) => {

    modalWin = new BrowserWindow({
        width: 800,
        height: 600,
        'minWidth': 500,
        'minHeight': 500,
        parent: winPage,
        modal: true,
        frame: false
    });

    modalWin.on('closed', () => {
        modalWin = null
    })

    modalWin.loadURL(path.join('file://', __dirname, curpath));

    modalWin.webContents.on('did-finish-load', () => {
                
        modalWin.webContents.send('data-edit', data);
        modalWin.webContents.openDevTools();
    })

}

exports.db = db;

initialize();