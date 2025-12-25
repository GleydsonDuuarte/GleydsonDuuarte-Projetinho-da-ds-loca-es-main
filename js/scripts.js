// js/scripts.js
let currentSlide = 0;
let carouselInterval;
const CAROUSEL_INTERVAL = 3000; // 3 segundos
let currentGalleryIndex = 0;
let currentGalleryImages = [];
let currentGalleryName = '';

async function applyConfig() {
    try {
        const config = await loadConfig();
        
        // 1. Atualizar foto de fundo do hero
        const heroSection = document.querySelector('.hero');
        if (heroSection && config.hero_background) {
            heroSection.style.background = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${config.hero_background}')`;
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
        }
        
        // 2. Atualizar telefones
        const phoneLinks = document.querySelectorAll('.phone-link');
        phoneLinks.forEach(link => {
            if (config.telefone_principal) {
                const phoneNumber = config.telefone_principal.replace(/\D/g, '');
                link.href = link.href.replace(/558589499750/g, phoneNumber);
                link.textContent = link.textContent.replace(/\(85\) 8949-9750/g, config.telefone_principal);
            }
        });
        
        // 3. Atualizar WhatsApp
        const whatsappLinks = document.querySelectorAll('a[href*="whatsapp"]');
        if (config.whatsapp) {
            whatsappLinks.forEach(link => {
                link.href = `https://api.whatsapp.com/send?phone=${config.whatsapp}`;
            });
        }
        
        // 4. Atualizar redes sociais
        const instagramLinks = document.querySelectorAll('a[href*="instagram"]');
        if (config.instagram) {
            instagramLinks.forEach(link => {
                link.href = config.instagram;
            });
        }
        
        const facebookLinks = document.querySelectorAll('a[href*="facebook"]');
        if (config.facebook) {
            facebookLinks.forEach(link => {
                link.href = config.facebook;
            });
        }
        
        console.log('✅ Configurações aplicadas');
        
    } catch (error) {
        console.error('❌ Erro ao aplicar configurações:', error);
    }
}

// CARROSSEL SOBRE NÓS
async function initAboutCarousel() {
    try {
        const config = await loadConfig();
        const motos = await loadMotosData();
        
        const carouselContainer = document.getElementById('aboutCarousel');
        const slidesContainer = carouselContainer?.querySelector('.carousel-slides');
        const indicatorsContainer = carouselContainer?.querySelector('.carousel-indicators');
        
        if (!slidesContainer || !indicatorsContainer) return;
        
        // Array de imagens para o carrossel
        let carouselImages = [];
        
        // 1. PRIORIDADE: Imagens específicas do carrossel da planilha
        if (config.carousel_images && config.carousel_images.length > 0) {
            config.carousel_images.forEach((img, index) => {
                carouselImages.push({
                    url: img.url,
                    type: 'carousel',
                    name: img.title
                });
            });
        }
        // 2. SEGUNDA OPÇÃO: hero_background + imagens das motos
        else {
            // Adicionar hero_background
            if (config.hero_background) {
                carouselImages.push({
                    url: config.hero_background,
                    type: 'hero',
                    name: 'DS Locações'
                });
            }
            
            // Adicionar imagens das motos (até 3)
            const motosComImagem = motos.filter(moto => moto.image && !moto.image.includes('unsplash.com/photo-1558618666'));
            motosComImagem.slice(0, 3).forEach((moto, index) => {
                carouselImages.push({
                    url: moto.image,
                    type: 'moto',
                    name: moto.name
                });
            });
        }
        
        // 3. FALLBACK: Imagens padrão se não tiver nenhuma
        if (carouselImages.length === 0) {
            carouselImages = [
                {
                    url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
                    type: 'default',
                    name: 'Nossa Frota'
                },
                {
                    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
                    type: 'default',
                    name: 'Atendimento Personalizado'
                },
                {
                    url: 'https://images.unsplash.com/photo-1605559141066-1549783d91e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
                    type: 'default',
                    name: 'Manutenção Especializada'
                }
            ];
        }
        
        // Limpar containers
        slidesContainer.innerHTML = '';
        indicatorsContainer.innerHTML = '';
        
        // Criar slides e indicadores
        carouselImages.forEach((image, index) => {
            // Criar slide
            const slide = document.createElement('div');
            slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            slide.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${image.url}')`;
            slide.dataset.index = index;
            
            // Adicionar título
            if (image.name) {
                slide.innerHTML = `
                    <div class="slide-overlay">
                        <div class="slide-title">${image.name}</div>
                    </div>
                `;
            }
            
            slidesContainer.appendChild(slide);
            
            // Criar indicador
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
            indicator.dataset.index = index;
            indicator.setAttribute('aria-label', `Ir para slide ${index + 1}`);
            indicator.addEventListener('click', () => goToSlide(index));
            
            indicatorsContainer.appendChild(indicator);
        });
        
        // Configurar controles
        const prevControl = carouselContainer.querySelector('.prev-control');
        const nextControl = carouselContainer.querySelector('.next-control');
        
        if (prevControl) {
            prevControl.addEventListener('click', prevSlide);
        }
        
        if (nextControl) {
            nextControl.addEventListener('click', nextSlide);
        }
        
        // Iniciar autoplay
        startCarousel();
        
        // Pausar autoplay ao passar o mouse
        carouselContainer.addEventListener('mouseenter', stopCarousel);
        carouselContainer.addEventListener('mouseleave', startCarousel);
        
        console.log(`✅ Carrossel inicializado com ${carouselImages.length} imagens`);
        
    } catch (error) {
        console.error('❌ Erro ao inicializar carrossel:', error);
    }
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    // Remover classe active de todos
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Adicionar classe active no slide atual
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    
    currentSlide = index;
    
    // Reiniciar autoplay
    resetCarousel();
}

function nextSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    goToSlide((currentSlide + 1) % slides.length);
}

function prevSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
}

function startCarousel() {
    stopCarousel();
    carouselInterval = setInterval(nextSlide, CAROUSEL_INTERVAL);
}

function stopCarousel() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

function resetCarousel() {
    stopCarousel();
    startCarousel();
}

// FUNÇÕES DA GALERIA
function openGallery(images, motoName, startIndex = 0) {
    if (!images || images.length === 0) return;
    
    currentGalleryImages = images;
    currentGalleryIndex = startIndex;
    currentGalleryName = motoName;
    
    const modal = document.getElementById('galleryModal');
    const mainImage = document.getElementById('mainImage');
    const modalMotoName = document.getElementById('modalMotoName');
    const imageCounter = document.getElementById('imageCounter');
    const thumbnails = document.getElementById('thumbnails');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Atualizar nome da moto
    modalMotoName.textContent = motoName;
    
    // Atualizar imagem principal
    updateMainImage();
    
    // Atualizar contador
    updateImageCounter();
    
    // Criar thumbnails
    thumbnails.innerHTML = '';
    currentGalleryImages.forEach((img, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === currentGalleryIndex ? 'active' : ''}`;
        thumbnail.innerHTML = `<img src="${img}" alt="Imagem ${index + 1}">`;
        thumbnail.addEventListener('click', () => {
            currentGalleryIndex = index;
            updateMainImage();
            updateImageCounter();
            updateThumbnails();
        });
        thumbnails.appendChild(thumbnail);
    });
    
    // Configurar navegação
    prevBtn.onclick = () => {
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateMainImage();
        updateImageCounter();
        updateThumbnails();
    };
    
    nextBtn.onclick = () => {
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
        updateMainImage();
        updateImageCounter();
        updateThumbnails();
    };
    
    // Abrir modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function updateMainImage() {
    const mainImage = document.getElementById('mainImage');
    if (currentGalleryImages[currentGalleryIndex]) {
        mainImage.src = currentGalleryImages[currentGalleryIndex];
        mainImage.alt = `${currentGalleryName} - Imagem ${currentGalleryIndex + 1}`;
    }
}

function updateImageCounter() {
    const imageCounter = document.getElementById('imageCounter');
    imageCounter.textContent = `${currentGalleryIndex + 1}/${currentGalleryImages.length}`;
}

function updateThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.classList.toggle('active', index === currentGalleryIndex);
    });
}

function setupGalleryEvents() {
    const modal = document.getElementById('galleryModal');
    const closeBtn = document.getElementById('closeModal');
    
    // Fechar modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Navegação com teclado
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            } else if (e.key === 'ArrowLeft') {
                currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
                updateMainImage();
                updateImageCounter();
                updateThumbnails();
            } else if (e.key === 'ArrowRight') {
                currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
                updateMainImage();
                updateImageCounter();
                updateThumbnails();
            }
        }
    });
}

// CARREGAR MOTOS DA PLANILHA
async function loadMotosSection() {
    try {
        const motos = await loadMotosData();
        const motosGrid = document.getElementById('motosGrid');
        
        if (!motosGrid || motos.length === 0) {
            motosGrid.innerHTML = '<p class="no-results">Nenhuma moto disponível no momento.</p>';
            return;
        }
        
        // Limpar grid
        motosGrid.innerHTML = '';
        
        // Adicionar cards das motos
        motos.forEach((moto, index) => {
            const card = createMotoCard(moto, index);
            motosGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('❌ Erro ao carregar motos:', error);
    }
}

function createMotoCard(moto, index) {
    const card = document.createElement('div');
    card.className = 'moto-card';
    
    // Badge de galeria se tiver mais de 1 imagem
    const galleryBadge = moto.gallery && moto.gallery.length > 1 
        ? `<div class="gallery-badge">
            <i class="fas fa-images"></i> ${moto.gallery.length} fotos
           </div>`
        : '';
    
    card.innerHTML = `
        ${galleryBadge}
        <img src="${moto.image}" alt="${moto.name}" class="moto-image">
        <div class="moto-info">
            <h3 class="moto-name">${moto.name}</h3>
            <div class="moto-price">${moto.price}</div>
            <div class="moto-details">
                <span><i class="fas fa-calendar-alt"></i> ${moto.year}</span>
                <span><i class="fas fa-tachometer-alt"></i> ${moto.km}</span>
                <span><i class="fas fa-tag"></i> ${moto.category}</span>
            </div>
            ${moto.features && moto.features.length > 0 ? `
                <div class="moto-features">
                    ${moto.features.slice(0, 3).map(feature => `<span>${feature}</span>`).join('')}
                    ${moto.features.length > 3 ? '<span>...</span>' : ''}
                </div>
            ` : ''}
            <div class="moto-location">
                <i class="fas fa-map-marker-alt"></i> ${moto.location}
            </div>
            <div class="view-gallery" data-moto-index="${index}">
                <i class="fas fa-images"></i> Ver Galeria
            </div>
        </div>
    `;
    
    // Adicionar evento para abrir galeria
    const galleryBtn = card.querySelector('.view-gallery');
    galleryBtn.addEventListener('click', () => {
        openGallery(moto.gallery, moto.name, 0);
    });
    
    // Adicionar evento para clicar na imagem da moto
    const motoImage = card.querySelector('.moto-image');
    motoImage.addEventListener('click', () => {
        openGallery(moto.gallery, moto.name, 0);
    });
    
    // Adicionar evento para selecionar plano ao clicar em "Contratar"
    const contratarBtn = card.querySelector('.btn');
    if (contratarBtn) {
        contratarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('contato').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('plano').value = moto.category.toLowerCase().includes('premium') ? 'premium' : 
                                                    moto.category.toLowerCase().includes('completo') ? 'completo' : 'basico';
        });
    }
    
    return card;
}

// CARREGAR PLANOS DA PLANILHA
async function loadPlanosSection() {
    const planosData = await loadPlanosData();
    const plansGrid = document.querySelector('.plans-grid');
    const planSelect = document.getElementById('plano');
    
    if (!plansGrid || planosData.length === 0) {
        // Usar planos padrão se não carregar da planilha
        const defaultPlans = [
            {
                id: 'basico',
                nome: 'Plano Básico',
                preco: 'R$ 1.299/mês',
                motos: 'Honda CG 160',
                seguro: 'Básico',
                manutencao: 'Preventiva',
                suporte: 'Não incluído',
                documentacao: 'Não incluída'
            },
            {
                id: 'completo',
                nome: 'Plano Completo',
                preco: 'R$ 1.599/mês',
                motos: 'Honda CG 160 ou Yamaha Factor 150',
                seguro: 'Completo',
                manutencao: 'Completa',
                suporte: '24h',
                documentacao: 'Digital',
                featured: true
            },
            {
                id: 'premium',
                nome: 'Plano Premium',
                preco: 'R$ 1.899/mês',
                motos: 'Honda Biz 125 ou similar',
                seguro: 'Premium',
                manutencao: 'Completa',
                suporte: '24h prioritário',
                documentacao: 'Digital + baú'
            }
        ];
        
        defaultPlans.forEach((plano, index) => {
            const planCard = createPlanCard(plano, index);
            plansGrid.appendChild(planCard);
            
            // Adicionar ao select
            const option = document.createElement('option');
            option.value = plano.id;
            option.textContent = plano.nome;
            planSelect.appendChild(option);
        });
        return;
    }
    
    // Limpar grid e select
    plansGrid.innerHTML = '';
    planSelect.innerHTML = '<option value="">Selecione um plano</option>';
    
    // Adicionar planos da planilha
    planosData.forEach((plano, index) => {
        const planCard = createPlanCard(plano, index);
        plansGrid.appendChild(planCard);
        
        // Adicionar ao select
        const option = document.createElement('option');
        option.value = plano.id;
        option.textContent = plano.nome;
        planSelect.appendChild(option);
    });
}

function createPlanCard(plano, index) {
    const card = document.createElement('div');
    card.className = `plan-card ${plano.id === 'completo' || plano.featured ? 'featured' : ''}`;
    
    card.innerHTML = `
        ${plano.id === 'completo' || plano.featured ? '<div class="plan-badge">Mais Popular</div>' : ''}
        
        <div class="plan-header">
            <h3>${plano.nome}</h3>
            <div class="plan-price">${plano.preco}<span>/mês</span></div>
        </div>
        
        <ul class="plan-features">
            ${plano.motos ? `<li><i class="fas fa-check"></i> ${plano.motos}</li>` : ''}
            ${plano.seguro ? `<li><i class="${plano.seguro.includes('Não') ? 'fas fa-times' : 'fas fa-check'}"></i> Seguro: ${plano.seguro}</li>` : ''}
            ${plano.manutencao ? `<li><i class="${plano.manutencao.includes('Não') ? 'fas fa-times' : 'fas fa-check'}"></i> Manutenção: ${plano.manutencao}</li>` : ''}
            ${plano.suporte ? `<li><i class="${plano.suporte.includes('Não') ? 'fas fa-times' : 'fas fa-check'}"></i> ${plano.suporte}</li>` : ''}
            ${plano.documentacao ? `<li><i class="${plano.documentacao.includes('Não') ? 'fas fa-times' : 'fas fa-check'}"></i> ${plano.documentacao}</li>` : ''}
        </ul>
        
        <a href="#contato" class="btn" data-plano="${plano.id}">Contratar</a>
    `;
    
    // Adicionar evento para selecionar plano
    const contratarBtn = card.querySelector('.btn');
    contratarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('contato').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('plano').value = plano.id;
    });
    
    return card;
}

// FORMULÁRIO
function setupForm() {
    const form = document.querySelector('form[name="contato"]');
    if (!form) return;
    
    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length <= 10) {
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else {
                value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
            
            e.target.value = value;
        });
    }
    
    // Preencher automaticamente o campo de plano quando clicar em "Contratar" nos cards
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
            
            document.getElementById('contato').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

function updateFooterInfo() {
    // Atualizar ano no footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO
async function init() {
    console.log('🚀 Inicializando site DS Locações...');
    
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
    
    // Aplicar configurações da planilha
    await applyConfig();
    
    // Inicializar carrossel "Sobre Nós"
    await initAboutCarousel();
    
    // Carregar motos da planilha
    await loadMotosSection();
    
    // Carregar planos da planilha
    await loadPlanosSection();
    
    // Atualizar informações do rodapé
    updateFooterInfo();
    
    console.log('✅ Site DS Locações inicializado com sucesso!');
}

// Inicializar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Exportar funções para uso global
window.openGallery = openGallery;