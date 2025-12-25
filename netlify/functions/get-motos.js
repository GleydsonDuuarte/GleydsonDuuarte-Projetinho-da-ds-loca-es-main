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
    const configUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Config`;
    console.log('⚙️ Buscando configurações...');
    
    const configResponse = await fetch(configUrl);
    let configData = {
      hero_background: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      telefone_principal: '(85) 8949-9750',
      whatsapp: '558589499750',
      instagram: 'https://www.instagram.com/ds_locacoes85',
      facebook: 'https://www.facebook.com/share/16SEdaRRyr'
    };
    
    if (configResponse.ok) {
      const configText = await configResponse.text();
      const configJson = JSON.parse(configText.substring(47).slice(0, -2));
      const configRows = configJson.table.rows;
      
      if (configRows && configRows.length > 0) {
        const carouselImages = [];
        
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
                title: cells[2]?.v || `Imagem ${carouselImages.length + 1}`
              });
            }
          }
        }
        
        // Adicionar array de imagens do carrossel
        if (carouselImages.length > 0) {
          configData.carousel_images = carouselImages;
        }
      }
    } else {
      console.log('📭 Página "Config" não encontrada, usando valores padrão');
    }
    
    // 2. BUSCAR MOTOS (página padrão/gid=0)
    const motosUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    console.log('📊 Buscando motos...');
    
    const motosResponse = await fetch(motosUrl);
    if (!motosResponse.ok) throw new Error(`HTTP motos error: ${motosResponse.status}`);
    
    const motosText = await motosResponse.text();
    const motosJson = JSON.parse(motosText.substring(47).slice(0, -2));
    const motosRows = motosJson.table.rows;
    
    // 3. BUSCAR PLANOS (página "Planos")
    const planosUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Planos`;
    console.log('📊 Buscando planos...');
    
    const planosResponse = await fetch(planosUrl);
    let planosData = [];
    
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
            id: cells[0]?.v,
            nome: cells[1]?.v || `Plano ${i}`,
            preco: cells[2]?.v || 'Consulte',
            motos: cells[3]?.v || '',
            seguro: cells[4]?.v || '',
            manutencao: cells[5]?.v || '',
            suporte: cells[6]?.v || '',
            documentacao: cells[7]?.v || '',
            status: cells[8]?.v || 'ativo'
          };
          
          if (plano.status === 'ativo') {
            planosData.push(plano);
          }
        }
      }
    } else {
      console.log('📭 Página "Planos" não encontrada');
    }
    
    // 4. PROCESSAR MOTOS
    const motos = [];
    
    if (motosRows && motosRows.length > 1) {
      for (let i = 1; i < motosRows.length; i++) {
        const row = motosRows[i];
        const cells = row.c || [];
        
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
        
        if (cells[7]?.v) {
          moto.features = cells[7].v.split(',').map(f => f.trim()).filter(f => f);
        }
        
        if (cells[8]?.v) {
          moto.gallery = cells[8].v.split(',').map(g => g.trim()).filter(g => g);
        } else if (moto.image) {
          moto.gallery = [moto.image];
        }
        
        motos.push(moto);
      }
    }

    console.log(`✅ ${motos.length} motos, ${planosData.length} planos carregados`);
    
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
    console.error('❌ Erro:', error);
    
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