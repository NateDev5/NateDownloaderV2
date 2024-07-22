document.getElementById("downloadform").addEventListener("submit", (e) => {
    e.preventDefault()

    let url = document.getElementById("yt_url").value;
    window.electronAPI.download(url);

    document.getElementById("download_container").classList.add("d-none")
    document.getElementById("downloading_container").classList.remove("d-none")
})

window.electronAPI.init_bar((max) => {
    document.getElementById("progress_bar_progress").style.width = 0;
    document.getElementById("progress_text").innerText = `0/${max}`;
})

window.electronAPI.increment_bar((raw_progress, raw_max, max, progress) => {
    let width = (raw_progress / raw_max) * 100;
    document.getElementById("progress_bar_progress").style.width = `${width}%`;
    document.getElementById("progress_text").innerText = `${progress}/${max}`;
})

window.electronAPI.done(() => {
    document.getElementById("download_container").classList.remove("d-none")
    document.getElementById("downloading_container").classList.add("d-none")
    document.getElementById("yt_url").value = "";
})