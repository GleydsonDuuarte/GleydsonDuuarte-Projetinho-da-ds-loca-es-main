// js/data.js - Sistema de cache automático para DS Locações

// Cache para os dados
let motosCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function loadMotosData() {
    // Verificar cache
    if (motosCache && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
        console.log('📁 Usando dados em cache');
        return motosCache;
    }

    try {
        console.log('🔄 Buscando dados do Google Sheets...');
        
        const response = await fetch('/.netlify/functions/get-motos');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verificar se é um array válido
        if (Array.isArray(data)) {
            console.log('✅ Dados carregados:', data.length, 'motos');
            
            // Atualizar cache
            motosCache = data;
            lastFetchTime = Date.now();
            
            return data;
        } else {
            console.log('📭 Planilha vazia ou sem dados');
            return [];
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar do Sheets:', error.message);
        
        // Tentar fallback direto
        try {
            console.log('🔄 Tentando fallback direto...');
            const SHEET_ID = '1B7mt7DR2xl3NEGzv8ycpdFGDY7txl2jP-ROkG85lhH4';
            const response = await fetch(
                `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
            );
            
            if (!response.ok) {
                throw new Error(`Fallback HTTP: ${response.status}`);
            }
            
            const text = await response.text();
            const json = JSON.parse(text.substring(47).slice(0, -2));
            const rows = json.table.rows;
            
            const motos = [];
            
            // Pular cabeçalho (linha 0) e processar a partir da linha 1
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const cells = row.c || [];
                
                // Verificar se a linha tem dados (pelo menos nome)
                if (!cells[0] || !cells[0].v) continue;
                
                const moto = {
                    id: i,
                    name: cells[0]?.v || `Moto ${i}`,
                    price: cells[1]?.v || 'Consulte',
                    year: cells[2]?.v || '2024',
                    km: cells[3]?.v || '0-5.000 km',
                    image: cells[4]?.v || 'https://images.unsplash.com/photo-1558618666-fcd25856cd63?w=400',
                    location: cells[5]?.v || 'Fortaleza - CE',
                    category: cells[6]?.v || 'street',
                    features: [],
                    gallery: []
                };
                
                // Processar features (coluna 7)
                if (cells[7]?.v) {
                    moto.features = cells[7].v.split(',').map(f => f.trim()).filter(f => f);
                }
                
                // Processar galeria (coluna 8)
                if (cells[8]?.v) {
                    moto.gallery = cells[8].v.split(',').map(g => g.trim()).filter(g => g);
                } else if (moto.image) {
                    // Se não tiver galeria, usar a imagem principal
                    moto.gallery = [moto.image];
                }
                
                motos.push(moto);
            }
            
            motosCache = motos;
            lastFetchTime = Date.now();
            
            console.log(`✅ ${motos.length} motos carregadas via fallback`);
            return motos;
            
        } catch (fallbackError) {
            console.error('❌ Fallback também falhou:', fallbackError.message);
            return [];
        }
    }
}

// Informações da empresa DS Locações
const companyInfo = {
    name: "DS Locações",
    slogan: "Aluguel de motos para aplicativos",
    phones: ["(85) 8949-9750"],
    workingHours: {
        weekdays: "Segunda a Sexta: 8h às 18h",
        saturday: "Sábado: 8h às 12h",
        support: "Suporte emergencial: 24h"
    },
    socialMedia: {
        instagram: "https://www.instagram.com/ds_locacoes85",
        whatsapp: "https://api.whatsapp.com/send?phone=558589499750",
        facebook: "https://www.facebook.com/share/16SEdaRRyr/?mibextid=wwXIfr"
    },
    services: ["Aluguel", "Aplicativos", "Gestão", "Suporte"]
};

// Exportar para uso global
window.loadMotosData = loadMotosData;
window.companyInfo = companyInfo;