// js/data.js - Sistema de cache completo para DS Locações

// Cache para os dados
let siteDataCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function loadSiteData() {
    // Verificar cache
    if (siteDataCache && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
        console.log('📁 Usando dados em cache');
        return siteDataCache;
    }

    try {
        console.log('🔄 Buscando dados do Google Sheets...');
        
        const response = await fetch('/.netlify/functions/get-data');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            siteDataCache = data;
            lastFetchTime = Date.now();
            
            console.log(`✅ ${data.motos?.length || 0} motos, ${data.planos?.length || 0} planos carregados`);
            return data;
        } else {
            console.log('📭 Nenhum dado encontrado');
            return {
                config: {},
                motos: [],
                planos: []
            };
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error.message);
        return {
            config: {},
            motos: [],
            planos: []
        };
    }
}

async function loadMotosData() {
    const data = await loadSiteData();
    return data.motos || [];
}

async function loadPlanosData() {
    const data = await loadSiteData();
    return data.planos || [];
}

async function loadConfig() {
    const data = await loadSiteData();
    return data.config || {};
}

// Exportar para uso global
window.loadMotosData = loadMotosData;
window.loadPlanosData = loadPlanosData;
window.loadConfig = loadConfig;
window.loadSiteData = loadSiteData;