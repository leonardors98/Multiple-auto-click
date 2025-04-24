/**
 * Função para simular cliques em uma posição específica (x, y).
 * Dispara os eventos necessários para simular um clique real.
 * @param {number} x - Coordenada X do clique.
 * @param {number} y - Coordenada Y do clique.
 */
export function clickAtPosition(x, y) {
    // Obter o elemento na posição especificada
    const element = document.elementFromPoint(x, y);

    // Se nenhum elemento foi encontrado, exibir um aviso e sair
    if (!element) {
        console.warn(`Nenhum elemento encontrado na posição (${x}, ${y}).`);
        return;
    }

    // Disparar os eventos de mouse para simular um clique
    ['mousemove', 'mousedown', 'mouseup', 'click'].forEach((type) => {
        const event = new MouseEvent(type, {
            bubbles: true, // Permitir propagação do evento
            cancelable: true, // Permitir que o evento seja cancelado
            view: window, // Associar o evento à janela atual
            clientX: x, // Coordenada X do clique
            clientY: y // Coordenada Y do clique
        });
        element.dispatchEvent(event); // Disparar o evento no elemento encontrado
    });
}