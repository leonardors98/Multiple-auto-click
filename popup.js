document.getElementById("configure").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
            chrome.scripting.executeScript(
                {
                    target: { tabId: activeTab.id },
                    files: ["content.js"], // Garante que o script será injetado
                },
                () => {
                    chrome.tabs.sendMessage(activeTab.id, { type: "startConfig" });
                }
            );
        }
    });
});

document.getElementById("start").addEventListener("click", () => {
    const delay = parseInt(document.getElementById("delay").value, 10);

    // Recupera os marcadores configurados
    chrome.storage.local.get("clickConfig", ({ clickConfig }) => {
        // Salva o delay no storage
        chrome.storage.local.set({ savedDelay: delay });

        const config = {
            ...clickConfig,
            delays: clickConfig?.points?.map(() => delay) || [],
        };

        chrome.runtime.sendMessage({ type: "startClicking", config });
    });
});

document.getElementById("stop").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "stopClicking" });
});

document.getElementById("clear").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
            chrome.tabs.sendMessage(activeTab.id, { type: "clearMarkers" });
        }
    });
});

// Recuperar o delay salvo
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("savedDelay", ({ savedDelay }) => {
        if (savedDelay) {
            document.getElementById("delay").value = savedDelay;
        }
    });
});