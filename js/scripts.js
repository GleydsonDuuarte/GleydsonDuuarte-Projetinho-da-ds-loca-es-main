// js/scripts.js - Funcionalidades DS Locações

let currentMotoIndex = 0;
let currentImageIndex = 0;
let motosData = [];
let currentSlide = 0;
let carouselInterval;
const CAROUSEL_INTERVAL = 3000; // 3 segundos

async function loadMotosSection() {
    const motosGrid = document.getElementById('motosGrid');
    
    if (!motosGrid) return;
    
    // Mostrar loading
    motosGrid.innerHTML = `
        <div class="loading-message">
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
            <div class="error-message">
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

async function loadPlanosSection() {
    const plansGrid = document.getElementById('plansGrid');
    
    if (!plansGrid) return;
    
    try {
        const planosData = await loadPlanosData();
        
        // Limpar grid
        plansGrid.innerHTML = '';
        
        if (planosData.length === 0) {
            // Planos padrão se não carregar da planilha
            plansGrid.innerHTML = `
                <div class="plan-card">
                    <div class="plan-header">
                        <h3>Plano Básico</h3>
                        <div class="plan-price">R$ 1.299<span>/mês</span></div>
                    </div>
                    <ul class="plan-features">
                        <li><i class="fas fa-check"></i> Honda CG 160</li>
                        <li><i class="fas fa-check"></i> Seguro básico</li>
                        <li><i class="fas fa-check"></i> Manutenção preventiva</li>
                        <li><i class="fas fa-times"></i> Suporte 24h</li>
                        <li><i class="fas fa-times"></i> Documentação digital</li>
                    </ul>
                    <a href="#contato" class="btn">Contratar</a>
                </div>
                
                <div class="plan-card featured">
                    <div class="plan-badge">Mais Popular</div>
                    <div class="plan-header">
                        <h3>Plano Completo</h3>
                        <div class="plan-price">R$ 1.599<span>/mês</span></div>
                    </div>
                    <ul class="plan-features">
                        <li><i class="fas fa-check"></i> Honda CG 160 ou Yamaha Factor 150</li>
                        <li><i class="fas fa-check"></i> Seguro completo</li>
                        <li><i class="fas fa-check"></i> Manutenção completa</li>
                        <li><i class="fas fa-check"></i> Suporte 24h</li>
                        <li><i class="fas fa-check"></i> Documentação digital</li>
                    </ul>
                    <a href="#contato" class="btn">Contratar</a>
                </div>
                
                <div class="plan-card">
                    <div class="plan-header">
                        <h3>Plano Premium</h3>
                        <div class="plan-price">R$ 1.899<span>/mês</span></div>
                    </div>
                    <ul class="plan-features">
                        <li><i class="fas fa-check"></i> Honda Biz 125 ou similar</li>
                        <li><i class="fas fa-check"></i> Seguro premium</li>
                        <li><i class="fas fa-check"></i> Manutenção completa</li>
                        <li><i class="fas fa-check"></i> Suporte 24h prioritário</li>
                        <li><i class="fas fa-check"></i> Documentação digital + baú</li>
                    </ul>
                    <a href="#contato" class="btn">Contratar</a>
                </div>
            `;
        } else {
            // Criar cards dos planos da planilha
            planosData.forEach((plano, index) => {
                const planCard = createPlanCard(plano, index);
                plansGrid.appendChild(planCard);
            });
        }
        
        console.log(`✅ ${planosData.length || 3} planos carregados`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar planos:', error);
        // Não mostrar erro, usar planos padrão
    }
}

function createPlanCard(plano, index) {
    const card = document.createElement('div');
    card.className = `plan-card ${plano.id === 'completo' || index === 1 ? 'featured' : ''}`;
    
    card.innerHTML = `
        ${plano.id === 'completo' || index === 1 ? '<div class="plan-badge">Mais Popular</div>' : ''}
        
        <div class="plan-header">
            <h3>${plano.nome || `Plano ${index + 1}`}</h3>
            <div class="plan-price">${plano.preco || 'Consulte'}<span>/mês</span></div>
        </div>
        
        <ul class="plan-features">
            ${plano.motos ? `<li><i class="fas fa-check"></i> ${plano.motos}</li>` : ''}
            ${plano.seguro ? `<li><i class="${plano.seguro.includes('Não') ? 'fas fa-times' : 'fas fa-check'}"></i> Seguro: ${plano.seguro}</li>` : ''}
            ${plano.manutencao ? `<li><i class="${plano.manutencao.includes('Não') ? 'fas fa-times' : 'fas fa-check'}"></i> Manutenção: ${plano.manutencao}</li>` : ''}
            ${plano.suporte ? `<li><i class="${plano.suporte.includes('Não') ? 'fas fa-times' : 'fas fa-check'}"></i> ${plano.suporte}</li>` : ''}
            ${plano.documentacao ? `<li><i class="${plano.documentacao.includes('Não') ? 'fas fa-times' : 'fas fa-check'}"></i> ${plano.documentacao}</li>` : ''}
            ${plano.features ? `<li><i class="fas fa-check"></i> ${plano.features}</li>` : ''}
        </ul>
        
        <a href="#contato" class="btn" data-plano="${plano.id || 'basico'}">Contratar</a>
    `;
    
    return card;
}

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
                link.textContent = config.telefone_principal;
            }
        });
        
        // 3. Atualizar WhatsApp
        const whatsappLinks = document.querySelectorAll('a[href*="whatsapp"]');
        if (config.whatsapp) {
            const whatsappNumber = config.whatsapp.replace(/\D/g, '');
            whatsappLinks.forEach(link => {
                link.href = `https://api.whatsapp.com/send?phone=${whatsappNumber}`;
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
        
        // 5. Preencher opções do select de planos
        const selectPlano = document.getElementById('plano');
        if (selectPlano) {
            // Limpar opções exceto a primeira
            while (selectPlano.options.length > 1) {
                selectPlano.remove(1);
            }
            
            // Adicionar opções da planilha
            const planosData = await loadPlanosData();
            if (planosData.length > 0) {
                planosData.forEach(plano => {
                    const option = document.createElement('option');
                    option.value = plano.id || 'basico';
                    option.textContent = `${plano.nome || 'Plano'} - ${plano.preco || 'Consulte'}`;
                    selectPlano.appendChild(option);
                });
            } else {
                // Opções padrão
                const planosPadrao = [
                    { id: 'basico', nome: 'Plano Básico', preco: 'R$ 1.299/mês' },
                    { id: 'completo', nome: 'Plano Completo', preco: 'R$ 1.599/mês' },
                    { id: 'premium', nome: 'Plano Premium', preco: 'R$ 1.899/mês' }
                ];
                
                planosPadrao.forEach(plano => {
                    const option = document.createElement('option');
                    option.value = plano.id;
                    option.textContent = `${plano.nome} - ${plano.preco}`;
                    selectPlano.appendChild(option);
                });
            }
        }
        
        console.log('✅ Configurações aplicadas');
        
    } catch (error) {
        console.error('❌ Erro ao aplicar configurações:', error);
    }
}

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
        
        // 1. Imagens específicas do carrossel da planilha
        if (config.carousel_images && config.carousel_images.length > 0) {
            config.carousel_images.forEach((img, index) => {
                carouselImages.push({
                    url: img.url,
                    title: img.title || `Imagem ${index + 1}`
                });
            });
        }
        // 2. Segunda opção: hero_background + imagens das motos
        else {
            // Adicionar hero_background
            if (config.hero_background) {
                carouselImages.push({
                    url: config.hero_background,
                    title: 'DS Locações'
                });
            }
            
            // Adicionar imagens das motos (até 3)
            const motosComImagem = motos.filter(moto => moto.image && !moto.image.includes('unsplash.com/photo-1558618666'));
            motosComImagem.slice(0, 3).forEach((moto, index) => {
                carouselImages.push({
                    url: moto.image,
                    title: moto.name
                });
            });
        }
        
        // 3. Fallback: Imagens padrão se não tiver nenhuma
        if (carouselImages.length === 0) {
            carouselImages = [
                {
                    url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
                    title: 'Nossa Frota'
                },
                {
                    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
                    title: 'Atendimento Personalizado'
                },
                {
                    url: 'https://images.unsplash.com/photo-1605559141066-1549783d91e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
                    title: 'Manutenção Especializada'
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
            if (image.title) {
                slide.innerHTML = `
                    <div class="slide-overlay">
                        <div class="slide-title">${image.title}</div>
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
    stopCarousel(); // Parar qualquer intervalo existente
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

// Funções da galeria
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
    imageCounter.textContent = `--${currentImageIndex + 1}/${images.length}--`;
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

function updateFooterInfo() {
    document.getElementById("year").textContent = new Date().getFullYear();
}

// Função principal de inicialização
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
            
            document.getElementById('contato').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
    
    // Aplicar configurações
    await applyConfig();
    
    // Inicializar carrossel "Sobre Nós"
    await initAboutCarousel();
    
    // Carregar motos
    await loadMotosSection();
    
    // Carregar planos
    await loadPlanosSection();
    
    // Atualizar ano atual no rodapé
    updateFooterInfo();
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);