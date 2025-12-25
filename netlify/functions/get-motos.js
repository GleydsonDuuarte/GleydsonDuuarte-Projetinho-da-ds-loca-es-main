// netlify/functions/get-motos.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder a requisições OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Permitir apenas GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    // ID da planilha DS Locações
    const SHEET_ID = '1B7mt7DR2xl3NEGzv8ycpdFGDY7txl2jP-ROkG85lhH4';
    
    // URL da API pública do Google Sheets
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    
    console.log('📊 Buscando dados da planilha DS Locações...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    
    // Remove o prefixo que o Google Sheets adiciona
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;
    
    if (!rows || rows.length <= 1) { // <= 1 porque a primeira linha é cabeçalho
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }
    
    // Converter dados da planilha
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

    console.log(`✅ ${motos.length} motos carregadas`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(motos)
    };
    
  } catch (error) {
    console.error('❌ Erro:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao carregar dados',
        message: error.message
      })
    };
  }
};