// Variáveis globais para gerenciar o estado do auto click e a configuração
let isAutoClicking = false;
let clickConfig = {
    points: [], // Armazena os pontos a serem clicados
    delays: [], // Armazena os delays entre os cliques
};

// Ouve mensagens enviadas de outros scripts (popup.js ou content.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "startClicking") {
        // Inicia o auto click
        isAutoClicking = true;
        clickConfig = message.config;

        // Envia mensagem para o content.js iniciar os cliques
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: "startClicking",
                config: clickConfig,
            });
        });

        sendResponse({ success: true });
    } else if (message.type === "stopClicking") {
        // Para o auto click
        isAutoClicking = false;

        // Envia mensagem para o content.js parar os cliques
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { type: "stopClicking" });
        });

        sendResponse({ success: true });
    } else if (message.type === "saveConfig") {
        // Salva a configuração dos pontos e delays
        clickConfig = message.config;
        chrome.storage.local.set({ clickConfig }, () => {
            sendResponse({ success: true });
        });

        return true; // Indica que o envio da resposta é assíncrono
    }
});