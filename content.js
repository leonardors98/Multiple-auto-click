/**
 * Função para simular cliques em uma posição específica (x, y).
 * Dispara os eventos necessários para simular um clique real.
 * @param {number} x - Coordenada X do clique.
 * @param {number} y - Coordenada Y do clique.
 */
function clickAtPosition(x, y) {
    const element = document.elementFromPoint(x, y);

    if (!element) {
        console.warn(`Nenhum elemento encontrado na posição (${x}, ${y}).`);
        return;
    }

    ['mousemove', 'mousedown', 'mouseup', 'click'].forEach((type) => {
        const event = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: x,
            clientY: y
        });
        element.dispatchEvent(event);
    });
}

(() => {
    let isConfiguring = false; // Estado para saber se estamos no modo de configuração
    let selectedPoints = []; // Lista de pontos selecionados pelo usuário
    let overlay; // Elemento de overlay para capturar cliques e movimentos do mouse
    let mouseFollower; // Marcador visual que segue o mouse
    let infoMessage; // Mensagem de instrução exibida no modo de configuração
    let autoClickInterval = null; // Intervalo de auto click

    /**
     * Configura o overlay para capturar cliques e movimentos do mouse.
     */
    function setupOverlay() {
        if (overlay) return;

        overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
        overlay.style.zIndex = "99999";
        overlay.style.cursor = "crosshair";
        document.body.appendChild(overlay);

        mouseFollower = document.createElement("div");
        mouseFollower.style.position = "absolute";
        mouseFollower.style.width = "10px";
        mouseFollower.style.height = "10px";
        mouseFollower.style.backgroundColor = "blue";
        mouseFollower.style.borderRadius = "50%";
        mouseFollower.style.pointerEvents = "none";
        mouseFollower.style.zIndex = "100000";
        document.body.appendChild(mouseFollower);

        overlay.addEventListener("mousemove", (e) => {
            mouseFollower.style.left = `${e.clientX}px`;
            mouseFollower.style.top = `${e.clientY}px`;
            mouseFollower.style.transform = "translate(-50%, -50%)";
        });

        overlay.addEventListener("click", (e) => {
            if (isConfiguring) {
                const x = e.clientX;
                const y = e.clientY;
                selectedPoints.push({ x, y });

                // Atualiza a exibição dos pontos
                renderMarkers();
            }
        });

        infoMessage = document.createElement("div");
        infoMessage.textContent = "Aperte 'ESC' para sair do modo configuração";
        infoMessage.style.position = "fixed";
        infoMessage.style.top = "10px";
        infoMessage.style.left = "50%";
        infoMessage.style.transform = "translateX(-50%)";
        infoMessage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        infoMessage.style.color = "white";
        infoMessage.style.padding = "10px 20px";
        infoMessage.style.borderRadius = "5px";
        infoMessage.style.zIndex = "100001";
        infoMessage.style.fontFamily = "Arial, sans-serif";
        infoMessage.style.fontSize = "14px";
        document.body.appendChild(infoMessage);
    }

    /**
     * Remove o overlay e outros elementos relacionados ao modo de configuração.
     */
    function removeOverlay() {
        if (overlay) {
            overlay.remove();
            overlay = null;
        }
        if (mouseFollower) {
            mouseFollower.remove();
            mouseFollower = null;
        }
        if (infoMessage) {
            infoMessage.remove();
            infoMessage = null;
        }
    }

    /**
     * Exibe os marcadores nos pontos selecionados.
     */
    function renderMarkers() {
        document.querySelectorAll(".click-marker").forEach((marker) => marker.remove());
        selectedPoints.forEach(({ x, y }) => {
            const marker = document.createElement("div");
            marker.className = "click-marker";
            marker.style.position = "absolute";
            marker.style.width = "10px";
            marker.style.height = "10px";
            marker.style.backgroundColor = "red";
            marker.style.borderRadius = "50%";
            marker.style.left = `${x}px`;
            marker.style.top = `${y}px`;
            marker.style.transform = "translate(-50%, -50%)";
            marker.style.zIndex = "100000";
            document.body.appendChild(marker);
        });
    }

    /**
     * Limpa todos os marcadores e pontos selecionados.
     */
    function clearMarkers() {
        selectedPoints = [];
        renderMarkers();
        stopAutoClick();
    }

    /**
     * Inicia o auto click nos pontos selecionados.
     * @param {Array} points - Lista de pontos para clicar.
     * @param {Array} delays - Lista de delays entre os cliques.
     */
    function startAutoClick(points, delays) {
        stopAutoClick();

        if (points.length === 0) {
            console.warn("Nenhum ponto selecionado para iniciar o auto click.");
            return;
        }

        let index = 0;
        autoClickInterval = setInterval(() => {
            const point = points[index];
            clickAtPosition(point.x, point.y);
            index = (index + 1) % points.length;
        }, delays[index] || 500);
    }

    /**
     * Para o auto click.
     */
    function stopAutoClick() {
        if (autoClickInterval) {
            clearInterval(autoClickInterval);
            autoClickInterval = null;
        }
    }

    // Evento para sair do modo de configuração ao pressionar ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isConfiguring) {
            isConfiguring = false;
            removeOverlay();
            chrome.runtime.sendMessage({ type: "saveConfig", config: { points: selectedPoints } });
        }
    });

    // Listener para mensagens do runtime
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "startConfig") {
            if (isConfiguring) {
                isConfiguring = false;
                removeOverlay();
            } else {
                isConfiguring = true;
                setupOverlay();
            }
        } else if (message.type === "startClicking") {
            startAutoClick(selectedPoints, message.config?.delays || []);
        } else if (message.type === "stopClicking") {
            stopAutoClick();
        } else if (message.type === "clearMarkers") {
            clearMarkers();
        }
    });
})();