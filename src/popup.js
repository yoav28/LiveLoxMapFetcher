
const initializePopup = () => {
    const download = document.getElementById("download");

    download.addEventListener("click", () => {
        try {
            onClick();
        } catch (error) {
            log(`Error during download: ${error.message}`);
        }
    });
};


const log = (message) => {
    const logElement = document.getElementById("log");

    if (logElement) {
        logElement.textContent = message;
    }

    console.log(message);
};


const getClassId = async (chrome) => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0] && tabs[0].url) {
                const url = new URL(tabs[0].url);
                
                const tabId = tabs[0].id;
                const classId = url.searchParams.get("classId");

                if (classId) resolve({
                    tabId: tabId,
                    classId: classId,
                });

                else
                    reject(new Error("This extension only works on Livelox class pages."));

            } else
                reject(new Error("No active tab found."));
        });
    });
};


const fetchClassBlobUrl = async (classId) => {
        const response = await fetch("https://www.livelox.com/Data/ClassInfo", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "x-requested-with": "XMLHttpRequest"
            },
            body: JSON.stringify({
                eventId: null,
                courseIds: [],
                relayLegs: [],
                relayLegGroupIds: [],
                classIds: [parseInt(classId)]
            })
        });

    const data = await response.json();
    return data.general.classBlobUrl;
};


const fetchMapInfo = async (blobUrl) => {
    const response = await fetch(blobUrl);
    return await response.json();
};


const download = (chrome, url, filename) => {
    chrome.downloads.download({url, filename, conflictAction: "uniquify"}, (downloadId) => {
        if (chrome.runtime.lastError) return log(`Download failed: ${chrome.runtime.lastError.message}`);
        log(`Download started with ID: ${downloadId}`);
    });
};


const getClassStorage = async (chrome, tabId) => {
    const data = await chrome.storage.local.get('classStorage');

    if (data && data.classStorage) {
        const currentTime = Date.now();

        if (data.classStorage.tabId !== tabId)
            return;

        if (data.classStorage.timestamp && (currentTime - data.classStorage.timestamp) < 5 * 60 * 1000)
        {console.log("Using cached class storage.");
            return data.classStorage.url;}
    }
}


const onClick = async () => {
    log("Starting download process...");

    try {
        const chrome = window.chrome || window.browser;

        const {classId, tabId} = await getClassId(chrome);
        let classBlobUrl = await getClassStorage(chrome, tabId);

        if (!classBlobUrl)
            classBlobUrl = await fetchClassBlobUrl(classId);

        const mapData = await fetchMapInfo(classBlobUrl);
        const eventName = mapData.map.name;
        const mapUrl = mapData.map.images[0].url;

        log("Download initiated.");
        download(chrome, mapUrl, `${eventName}.png`);
        getClassStorage(chrome);
    } catch (error) {
        log(`Error during download: ${error.message}`);
    }
};


document.addEventListener("DOMContentLoaded", initializePopup);
