// netlify/functions/get-data.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const SHEET_ID = '1B7mt7DR2xl3NEGzv8ycpdFGDY7txl2jP-ROkG85lhH4';
    
    // 1. BUSCAR CONFIGURAÇÕES (página "Config")
    let configData = {
      hero_background: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      telefone_principal: '(85) 8949-9750',
      whatsapp: '558589499750',
      instagram: 'https://www.instagram.com/ds_locacoes85',
      facebook: 'https://www.facebook.com/share/16SEdaRRyr'
    };
    let carouselImages = [];

    try {
      const configUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=1512102756`;
      const configResponse = await fetch(configUrl);
      
      if (configResponse.ok) {
        const configText = await configResponse.text();
        const configJson = JSON.parse(configText.substring(47).slice(0, -2));
        const configRows = configJson.table.rows;
        
        if (configRows && configRows.length > 0) {
          for (let i = 0; i < configRows.length; i++) {
            const row = configRows[i];
            const cells = row.c || [];
            
            if (cells[0] && cells[0].v && cells[1] && cells[1].v) {
              const key = cells[0].v.toLowerCase().trim();
              const value = cells[1].v;
              
              // Armazenar configurações gerais
              configData[key] = value;
              
              // Coletar imagens do carrossel
              if (key.startsWith('carousel_')) {
                carouselImages.push({
                  url: value,
                  title: cells[2]?.v || `Imagem ${i+1}`
                });
              }
            }
          }
        }
      }
    } catch (configError) {
      console.log('⚠️ Página "Config" não encontrada ou com erro:', configError.message);
    }
    
    // Adicionar imagens do carrossel às configurações
    if (carouselImages.length > 0) {
      configData.carousel_images = carouselImages;
    }
    
    // 2. BUSCAR MOTOS (página principal)
    let motos = [];
    try {
      const motosUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
      const motosResponse = await fetch(motosUrl);
      
      if (motosResponse.ok) {
        const motosText = await motosResponse.text();
        const motosJson = JSON.parse(motosText.substring(47).slice(0, -2));
        const motosRows = motosJson.table.rows;
        
        if (motosRows && motosRows.length > 1) {
          for (let i = 1; i < motosRows.length; i++) {
            const row = motosRows[i];
            const cells = row.c || [];
            
            // Verificar se tem nome (coluna A)
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
            
            // Processar features (coluna H)
            if (cells[7]?.v) {
              moto.features = cells[7].v.split(',').map(f => f.trim()).filter(f => f);
            }
            
            // Processar galeria (coluna I)
            if (cells[8]?.v) {
              moto.gallery = cells[8].v.split(',').map(g => g.trim()).filter(g => g);
            } else if (moto.image) {
              moto.gallery = [moto.image];
            }
            
            motos.push(moto);
          }
        }
      }
    } catch (motosError) {
      console.log('⚠️ Erro ao carregar motos:', motosError.message);
    }
    
    // 3. BUSCAR PLANOS (página "Planos")
    let planosData = [];
    try {
      const planosUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=225130349`;
      const planosResponse = await fetch(planosUrl);
      
      if (planosResponse.ok) {
        const planosText = await planosResponse.text();
        const planosJson = JSON.parse(planosText.substring(47).slice(0, -2));
        const planosRows = planosJson.table.rows;
        
        if (planosRows && planosRows.length > 1) {
          for (let i = 1; i < planosRows.length; i++) {
            const row = planosRows[i];
            const cells = row.c || [];
            
            if (!cells[0] || !cells[0].v) continue;
            
            const plano = {
              id: cells[0]?.v, // Coluna A: ID
              nome: cells[1]?.v || `Plano ${i}`, // Coluna B: Nome
              preco: cells[2]?.v || 'Consulte', // Coluna C: Preço
              motos: cells[3]?.v || '', // Coluna D: Motos
              seguro: cells[4]?.v || '', // Coluna E: Seguro
              manutencao: cells[5]?.v || '', // Coluna F: Manutenção
              suporte: cells[6]?.v || '', // Coluna G: Suporte
              documentacao: cells[7]?.v || '', // Coluna H: Documentação
              features: cells[8]?.v || '', // Coluna I: Features extras
              status: cells[9]?.v || 'ativo' // Coluna J: Status
            };
            
            if (plano.status === 'ativo') {
              planosData.push(plano);
            }
          }
        }
      }
    } catch (planosError) {
      console.log('⚠️ Página "Planos" não encontrada ou com erro:', planosError.message);
    }

    console.log(`✅ ${motos.length} motos, ${planosData.length} planos, ${carouselImages.length} imagens do carrossel carregados`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        config: configData,
        motos: motos,
        planos: planosData,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Erro ao carregar dados',
        message: error.message
      })
    };
  }
};