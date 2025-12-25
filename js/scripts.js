// js/scripts.js - Funcionalidades DS Locações

let currentMotoIndex = 0;
let currentImageIndex = 0;
let motosData = [];

async function loadMotosSection() {
    const motosGrid = document.getElementById('motosGrid');
    
    if (!motosGrid) return;
    
    // Mostrar loading
    motosGrid.innerHTML = `
        <div class="loading-message" id="loadingMessage">
            <i class="fas fa-spinner fa-spin"></i> Carregando frota de motos...
        </div>
    `;
    
    try {
        motosData = await loadMotosData();
        
        // Limpar grid
        motosGrid.innerHTML = '';
        
        if (motosData.length === 0) {
            motosGrid.innerHTML = `
                <div class="no-vehicles">
                    <i class="fas fa-motorcycle"></i>
                    <h3>Nenhuma moto disponível no momento</h3>
                    <p>Volte em breve para conferir nossa frota.</p>
                </div>
            `;
            return;
        }
        
        // Adicionar motos ao grid
        motosData.forEach((moto, index) => {
            const motoCard = createMotoCard(moto, index);
            motosGrid.appendChild(motoCard);
        });
        
        console.log(`✅ ${motosData.length} motos carregadas`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar motos:', error);
        
        motosGrid.innerHTML = `
            <div class="error-message" id="errorMessage">
                <i class="fas fa-exclamation-triangle"></i> 
                <p>Erro ao carregar as motos. Por favor, tente novamente mais tarde.</p>
                <button class="btn" onclick="location.reload()">Tentar Novamente</button>
            </div>
        `;
    }
}

function createMotoCard(moto, index) {
    const card = document.createElement('div');
    card.className = 'moto-card';
    
    // Garantir que galeria seja um array
    const gallery = Array.isArray(moto.gallery) && moto.gallery.length > 0 ? moto.gallery : [moto.image];
    const hasGallery = gallery.length > 1;
    
    card.innerHTML = `
        ${hasGallery ? `
            <div class="gallery-badge">
                <i class="fas fa-images"></i> ${gallery.length} foto${gallery.length > 1 ? 's' : ''}
            </div>
        ` : ''}
        
        <img src="${moto.image}" alt="${moto.name}" class="moto-image" 
             onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25856cd63?w=400'">
        
        <div class="moto-info">
            <h3 class="moto-name">${moto.name}</h3>
            <div class="moto-price">${moto.price}</div>
            
            <div class="moto-details">
                <span><i class="fas fa-calendar"></i> ${moto.year}</span>
                <span><i class="fas fa-tachometer-alt"></i> ${moto.km}</span>
                ${moto.category ? `<span><i class="fas fa-motorcycle"></i> ${moto.category}</span>` : ''}
            </div>
            
            ${moto.features && moto.features.length > 0 ? `
                <div class="moto-features">
                    ${moto.features.map(feature => `<span>${feature.trim()}</span>`).join('')}
                </div>
            ` : ''}
            
            <div class="moto-location">
                <i class="fas fa-map-marker-alt"></i> 
                <span>${moto.location}</span>
            </div>
            
            ${hasGallery ? `
                <div class="view-gallery">
                    <i class="fas fa-expand"></i> Ver Galeria
                </div>
            ` : ''}
            
            <a href="#contato" class="btn" data-moto="${moto.name}" 
               style="margin-top: 15px; display: block; text-align: center;">
                Tenho Interesse
            </a>
        </div>
    `;
    
    // Evento para abrir galeria - apenas no card, não no botão
    card.addEventListener('click', (e) => {
        // Não abrir galeria se clicar no botão "Tenho Interesse"
        if (!e.target.closest('.btn') && !e.target.classList.contains('view-gallery')) {
            openGallery(moto, index);
        }
    });
    
    // Evento específico para o botão "Ver Galeria"
    const viewGalleryBtn = card.querySelector('.view-gallery');
    if (viewGalleryBtn) {
        viewGalleryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openGallery(moto, index);
        });
    }
    
    return card;
}

function openGallery(moto, motoIndex) {
    currentMotoIndex = motoIndex;
    currentImageIndex = 0;
    
    const modal = document.getElementById('galleryModal');
    const modalMotoName = document.getElementById('modalMotoName');
    const mainImage = document.getElementById('mainImage');
    
    modalMotoName.textContent = moto.name;
    
    const images = Array.isArray(moto.gallery) && moto.gallery.length > 0 ? moto.gallery : [moto.image];
    mainImage.src = images[0];
    
    loadThumbnails(images, moto.name);
    updateImageCounter();
    updateNavigationButtons();
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeGallery() {
    const modal = document.getElementById('galleryModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function loadThumbnails(images, motoName) {
    const thumbnailsContainer = document.getElementById('thumbnails');
    thumbnailsContainer.innerHTML = '';
    
    images.forEach((image, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = image;
        thumbnail.alt = `Foto ${index + 1} da ${motoName}`;
        thumbnail.className = `thumbnail ${index === currentImageIndex ? 'active' : ''}`;
        thumbnail.onclick = () => changeImage(index);
        thumbnail.onerror = function() {
            this.src = 'https://images.unsplash.com/photo-1558618666-fcd25856cd63?w=400';
        };
        
        thumbnailsContainer.appendChild(thumbnail);
    });
}

function changeImage(index) {
    currentImageIndex = index;
    const moto = motosData[currentMotoIndex];
    const mainImage = document.getElementById('mainImage');
    const images = Array.isArray(moto.gallery) && moto.gallery.length > 0 ? moto.gallery : [moto.image];
    
    mainImage.src = images[index];
    updateImageCounter();
    updateThumbnails();
    updateNavigationButtons();
}

function prevImage() {
    if (currentImageIndex > 0) {
        changeImage(currentImageIndex - 1);
    }
}

function nextImage() {
    const moto = motosData[currentMotoIndex];
    const images = Array.isArray(moto.gallery) && moto.gallery.length > 0 ? moto.gallery : [moto.image];
    if (currentImageIndex < images.length - 1) {
        changeImage(currentImageIndex + 1);
    }
}

function updateImageCounter() {
    const moto = motosData[currentMotoIndex];
    const images = Array.isArray(moto.gallery) && moto.gallery.length > 0 ? moto.gallery : [moto.image];
    const imageCounter = document.getElementById('imageCounter');
    imageCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
}

function updateThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

function updateNavigationButtons() {
    const moto = motosData[currentMotoIndex];
    const images = Array.isArray(moto.gallery) && moto.gallery.length > 0 ? moto.gallery : [moto.image];
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === images.length - 1;
}

function setupGalleryEvents() {
    const modal = document.getElementById('galleryModal');
    const closeBtn = document.getElementById('closeModal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Fechar modal
    closeBtn.onclick = closeGallery;
    
    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeGallery();
        }
    };
    
    // Navegação
    prevBtn.onclick = prevImage;
    nextBtn.onclick = nextImage;
    
    // Navegação por teclado
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('galleryModal');
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') closeGallery();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        }
    });
}

function setupForm() {
    const form = document.querySelector('form[name="contato"]');
    if (form) {
        form.addEventListener('submit', function(e) {
            // Validação básica
            const nome = document.getElementById('nome').value;
            const telefone = document.getElementById('telefone').value;
            
            if (!nome || !telefone) {
                e.preventDefault();
                alert('Por favor, preencha pelo menos o nome e telefone.');
                return;
            }
            
            console.log('Formulário sendo enviado para Netlify...');
        });
    }
}

async function init() {
    // Configurar eventos da galeria
    setupGalleryEvents();
    
    // Configurar formulário
    setupForm();
    
    // Menu Mobile
    document.querySelector('.mobile-menu').addEventListener('click', function() {
        document.querySelector('nav ul').classList.toggle('show');
    });
    
    // Navegação suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Fechar menu mobile se estiver aberto
                document.querySelector('nav ul').classList.remove('show');
            }
        });
    });
    
    // Preencher automaticamente o campo de plano quando clicar em "Tenho Interesse"
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn') && e.target.hasAttribute('data-moto')) {
            const motoName = e.target.getAttribute('data-moto');
            const select = document.getElementById('plano');
            
            let planoValue = 'completo';
            if (motoName.includes('Biz') || motoName.includes('NMax') || motoName.includes('125')) {
                planoValue = 'premium';
            } else if (motoName.includes('CG') || motoName.includes('Factor') || motoName.includes('160') || motoName.includes('150')) {
                planoValue = 'completo';
            } else {
                planoValue = 'basico';
            }
            
            select.value = planoValue;
            
            // Rolar até o formulário
            document.getElementById('contato').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
    
    // Atualizar ano atual no rodapé
    updateFooterInfo();
    
    // Carregar motos automaticamente
    await loadMotosSection();
}

function updateFooterInfo() {
    document.getElementById("year").textContent = new Date().getFullYear();
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);