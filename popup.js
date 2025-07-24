
const initializePopup = () => {
    const download = document.getElementById("download");
    
    download.addEventListener("click", () => {
        try {
            onDownload();
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
}


const onDownload = () => {
    log("Starting download process...");
    
    const chrome = window.chrome || window.browser;
    
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const url = new URL(tabs[0].url);
        const classId = url.searchParams.get("classId");
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
        const classBlobUrl = data.general.classBlobUrl;
        log(`Class Blob URL: ${classBlobUrl}`);
        
        
        const response_ = await fetch(classBlobUrl);
        const data_ = await response_.json();
        
        const eventName = data_.map.name;
        const mapUrl = data_.map.images[0].url;


        log("Download initiated.");
        
        chrome.downloads.download({
            url: mapUrl,
            filename: `${eventName}.png`,
            conflictAction: "uniquify"
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                log(`Download failed: ${chrome.runtime.lastError.message}`);
            } else {
                log(`Download started with ID: ${downloadId}`);
            }
        });
    });
};


document.addEventListener("DOMContentLoaded", initializePopup);

