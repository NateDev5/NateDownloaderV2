const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const path = require('node:path')
const youtubedl = require('youtube-dl-exec')
const https = require('https')
const fs = require('fs')
const ProgressBar = require('electron-progressbar');
const byteSize = require('byte-size')

let mainWin;

const createWindow = () => {
    mainWin = new BrowserWindow({
        width: 500,
        height: 280,
        resizable: true,
        fullscreenable: false,
        fullscreen: false,
        maximizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWin.loadFile('index.html')
    mainWin.removeMenu()

    if (!fs.existsSync("./downloads")) fs.mkdirSync('./downloads')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

const ytUrlRegex = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/

ipcMain.on("download", async (e, url) => {
    let isYtUrl = ytUrlRegex.test(url);

    if (isYtUrl) {
        const subprocess = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            extractAudio: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        });
        let written = 0;
        let download = subprocess.requested_downloads[0];
        const file = fs.createWriteStream(`./downloads/${subprocess.title}.mp3`)
        mainWin.webContents.send("init_bar", byteSize(download.filesize).toString());
        https.get(download.url, (res) => {
            res.on("data", data => {
                file.write(data, () => {
                    written += data.length;
                    mainWin.webContents.send("increment_bar", written, download.filesize, byteSize(download.filesize).toString(), byteSize(written).toString());
                })
            })

            res.on("close", () => {
                mainWin.webContents.send("done")
                file.close();
                if(file.bytesWritten != download.filesize)
                    console.log(`File is missing some bytes ${download.filesize - file.bytesWritten}`)
            })
        })
    }
    else {
        mainWin.webContents.send("done")
    }
})