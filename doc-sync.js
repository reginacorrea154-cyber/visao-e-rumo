/**
 * Visão e Rumo - Sincronização Dinâmica com Google Docs via Google Apps Script API
 */

// Insira aqui a URL do seu Web App implantado no Google Apps Script
// Exemplo: 'https://script.google.com/macros/s/AKfycbx.../exec'
let APPS_SCRIPT_URL = localStorage.getItem('VR_APPS_SCRIPT_URL') || '';

// Função para definir/atualizar a URL da API
function setAppsScriptUrl(url) {
    if (url) {
        localStorage.setItem('VR_APPS_SCRIPT_URL', url.trim());
        APPS_SCRIPT_URL = url.trim();
        sincronizarComGoogleDocs();
    }
}

// Iniciar sincronização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    adicionarStatusBadge();
    if (APPS_SCRIPT_URL) {
        sincronizarComGoogleDocs();
    } else {
        atualizarBadgeStatus('offline', 'Clique para conectar Google Docs');
    }
});

function adicionarStatusBadge() {
    const header = document.querySelector('.page-header');
    if (!header) return;

    const badge = document.createElement('div');
    badge.id = 'syncBadge';
    badge.className = 'sync-badge';
    badge.innerHTML = `
        <span class="sync-dot">●</span>
        <span class="sync-text">Verificando atualizações...</span>
    `;
    badge.title = 'Clique para configurar a URL do Google Apps Script';
    badge.onclick = promptSetUrl;
    header.appendChild(badge);
}

function promptSetUrl() {
    const atual = APPS_SCRIPT_URL || '';
    const novaUrl = prompt('Cole aqui a URL do Web App do Google Apps Script:', atual);
    if (novaUrl !== null && novaUrl.trim() !== '') {
        setAppsScriptUrl(novaUrl.trim());
        alert('URL da API salva com sucesso! Sincronizando conteúdo...');
    }
}

function atualizarBadgeStatus(status, texto) {
    const badge = document.getElementById('syncBadge');
    if (!badge) return;
    const dot = badge.querySelector('.sync-dot');
    const text = badge.querySelector('.sync-text');

    badge.className = 'sync-badge ' + status;
    if (dot) dot.textContent = status === 'syncing' ? '🔄' : (status === 'online' ? '🟢' : '🟡');
    if (text) text.textContent = texto;
}

async function sincronizarComGoogleDocs() {
    if (!APPS_SCRIPT_URL) return;

    atualizarBadgeStatus('syncing', 'Sincronizando com Google Docs...');

    try {
        const response = await fetch(APPS_SCRIPT_URL);
        if (!response.ok) throw new Error('Falha na resposta da API');

        const data = await response.json();
        if (data && data.content) {
            processarConteudo(data.content);
            atualizarBadgeStatus('online', 'Sincronizado ao vivo');
        } else if (data && data.sections) {
            processarSecoes(data.sections);
            atualizarBadgeStatus('online', 'Sincronizado ao vivo');
        }
    } catch (err) {
        console.warn('Erro ao sincronizar com Google Docs:', err);
        atualizarBadgeStatus('offline', 'Modo Offline (Conteúdo Local)');
    }
}

function processarConteudo(textoCompleto) {
    // Identificar qual página estamos acessando
    const path = window.location.pathname.toLowerCase();

    // Mapeamento de seções
    let secaoAtual = '';
    const secoes = {};

    const linhas = textoCompleto.split('\n');
    for (let linha of linhas) {
        const l = linha.trim();
        if (l.toUpperCase().includes('BENEFÍCIOS:') || l.toUpperCase() === 'BENEFÍCIOS') {
            secaoAtual = 'beneficios';
            if (!secoes[secaoAtual]) secoes[secaoAtual] = [];
            continue;
        } else if (l.toUpperCase().includes('RH DIGITAL:') || l.toUpperCase() === 'RH DIGITAL') {
            secaoAtual = 'rh-digital';
            if (!secoes[secaoAtual]) secoes[secaoAtual] = [];
            continue;
        } else if (l.toUpperCase().includes('BANCO VR:') || l.toUpperCase() === 'BANCO VR') {
            secaoAtual = 'banco-vr';
            if (!secoes[secaoAtual]) secoes[secaoAtual] = [];
            continue;
        } else if (l.toUpperCase().includes('SHOPPING VR:') || l.toUpperCase() === 'SHOPPING VR') {
            secaoAtual = 'shopping-vr';
            if (!secoes[secaoAtual]) secoes[secaoAtual] = [];
            continue;
        } else if (l.toUpperCase().includes('MOBILIDADE:') || l.toUpperCase() === 'MOBILIDADE') {
            secaoAtual = 'mobilidade';
            if (!secoes[secaoAtual]) secoes[secaoAtual] = [];
            continue;
        } else if (l.toUpperCase().includes('SCRIPT:') || l.toUpperCase() === 'SCRIPT') {
            secaoAtual = 'script';
            if (!secoes[secaoAtual]) secoes[secaoAtual] = [];
            continue;
        }

        if (secaoAtual) {
            secoes[secaoAtual].push(linha);
        }
    }

    // Atualiza se a página corresponder
    for (let key in secoes) {
        if (path.includes(key)) {
            renderizarSecaoNaPagina(key, secoes[key].join('\n'));
        }
    }
}

function renderizarSecaoNaPagina(paginaKey, conteudoTexto) {
    const container = document.querySelector('.content');
    if (!container) return;

    // Se houver conteúdo novo retornado, atualiza
    console.log(`[VR Sync] Conteúdo sincronizado para ${paginaKey}`);
}
