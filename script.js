/**
 * NÃO CONFUNDA — ENEM 2026
 * Scripts de Interatividade e CRO Mobile-First
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. DATA DINÂMICA DE HOJE (Escassez Top Bar)
     ========================================================================== */
  const dynamicDateEl = document.getElementById('dynamic-date');
  if (dynamicDateEl) {
    const today = new Date();
    const options = { day: '2-digit', month: 'long' };
    const dateFormatted = today.toLocaleDateString('pt-BR', options).toUpperCase();
    dynamicDateEl.textContent = dateFormatted;
  }

  /* ==========================================================================
     2. CRONÔMETRO REGRESSIVO DE 15 MINUTOS (Urgência da Oferta)
     ========================================================================== */
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    let totalSeconds = 14 * 60 + 59; // 14:59

    const timerInterval = setInterval(() => {
      if (totalSeconds <= 0) {
        totalSeconds = 15 * 60; // Reinicia suavemente em loop para manter a alta conversão
      }

      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      countdownEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      totalSeconds--;
    }, 1000);
  }

  /* ==========================================================================
     3. CARROSSEL DE PÁGINAS DO MATERIAL (Swipe Horizontal & Controles)
     ========================================================================== */
  const carouselTrack = document.getElementById('pdfCarouselTrack');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  const dots = document.querySelectorAll('.carousel-dot');
  const slides = document.querySelectorAll('.carousel-slide');

  if (carouselTrack && slides.length > 0) {
    let activeIndex = 0;

    const updateControls = (idx) => {
      activeIndex = Math.max(0, Math.min(idx, slides.length - 1));
      
      // Atualiza estado dos dots
      dots.forEach((dot, i) => {
        if (i === activeIndex) {
          dot.classList.add('active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('active');
          dot.removeAttribute('aria-current');
        }
      });

      // Atualiza botões
      if (prevBtn) prevBtn.disabled = activeIndex === 0;
      if (nextBtn) nextBtn.disabled = activeIndex === slides.length - 1;
    };

    const goToSlide = (idx) => {
      const targetSlide = slides[idx];
      if (targetSlide) {
        // Centraliza o slide no viewport do track
        const trackCenter = carouselTrack.offsetWidth / 2;
        const slideCenter = targetSlide.offsetLeft + (targetSlide.offsetWidth / 2);
        carouselTrack.scrollTo({
          left: slideCenter - trackCenter,
          behavior: 'smooth'
        });
      }
      updateControls(idx);
    };

    // Botões de Anterior / Próximo
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToSlide(activeIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToSlide(activeIndex + 1);
      });
    }

    // Clique direto nos dots de navegação
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
      });
    });

    // Detecção contínua ao rolar / arrastar com o dedo
    let scrollTimeout;
    carouselTrack.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const trackCenter = carouselTrack.scrollLeft + (carouselTrack.offsetWidth / 2);
        let closestIndex = 0;
        let minDistance = Infinity;

        slides.forEach((slide, idx) => {
          const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
          const distance = Math.abs(slideCenter - trackCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = idx;
          }
        });

        updateControls(closestIndex);
      }, 60);
    }, { passive: true });

    // Suporte a arrasto com mouse no Desktop
    let isMouseDown = false;
    let startX = 0;
    let initialScrollLeft = 0;

    carouselTrack.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      startX = e.pageX - carouselTrack.offsetLeft;
      initialScrollLeft = carouselTrack.scrollLeft;
      carouselTrack.style.scrollBehavior = 'auto';
      carouselTrack.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      if (isMouseDown) {
        isMouseDown = false;
        carouselTrack.style.scrollBehavior = 'smooth';
        carouselTrack.style.cursor = '';
      }
    });

    carouselTrack.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - carouselTrack.offsetLeft;
      const walk = (x - startX) * 1.5;
      carouselTrack.scrollLeft = initialScrollLeft - walk;
    });

    // Inicialização
    updateControls(0);
  }

  /* ==========================================================================
     5. TOGGLE DE LIKES ESTILO FACEBOOK (Prova Social Interativa)
     ========================================================================== */
  const likeBtns = document.querySelectorAll('.fb-like-btn');
  likeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const countSpan = btn.querySelector('.like-count');
      let currentCount = parseInt(btn.getAttribute('data-count'), 10) || 0;
      const isLiked = btn.classList.contains('liked');

      if (isLiked) {
        btn.classList.remove('liked');
        currentCount -= 1;
      } else {
        btn.classList.add('liked');
        currentCount += 1;
      }

      btn.setAttribute('data-count', currentCount);
      if (countSpan) {
        countSpan.textContent = currentCount;
      }
    });
  });

  /* ==========================================================================
     6. STICKY MOBILE CTA (Barra Fixa no Rodapé após Scroll)
     ========================================================================== */
  const stickyCta = document.getElementById('stickyCta');
  const closeStickyBtn = document.getElementById('closeStickyBtn');
  let stickyDismissed = false;

  if (stickyCta) {
    window.addEventListener('scroll', () => {
      if (stickyDismissed) return;

      if (window.scrollY > 350) {
        stickyCta.classList.add('visible');
        stickyCta.setAttribute('aria-hidden', 'false');
      } else {
        stickyCta.classList.remove('visible');
        stickyCta.setAttribute('aria-hidden', 'true');
      }
    }, { passive: true });

    if (closeStickyBtn) {
      closeStickyBtn.addEventListener('click', () => {
        stickyCta.classList.remove('visible');
        stickyCta.setAttribute('aria-hidden', 'true');
        stickyDismissed = true;
      });
    }
  }

  /* ==========================================================================
     7. TOAST DE PROVA SOCIAL FLUTUANTE (Compras Recentes em Tempo Real)
     ========================================================================== */
  const purchaseToast = document.getElementById('purchaseToast');
  const buyerNameEl = document.getElementById('buyerName');
  const buyerCityEl = document.getElementById('buyerCity');
  const buyerTimeEl = document.getElementById('buyerTime');

  const buyers = [
    { name: 'Lucas M.', city: 'São Paulo - SP', time: '2 minutos' },
    { name: 'Beatriz F.', city: 'Rio de Janeiro - RJ', time: '4 minutos' },
    { name: 'Matheus R.', city: 'Curitiba - PR', time: '6 minutos' },
    { name: 'Camila P.', city: 'Belo Horizonte - MG', time: '1 minuto' },
    { name: 'Ana Clara T.', city: 'Salvador - BA', time: '8 minutos' },
    { name: 'Rodrigo S.', city: 'Fortaleza - CE', time: '5 minutos' },
    { name: 'Juliana B.', city: 'Brasília - DF', time: '3 minutos' }
  ];

  let currentBuyerIdx = 0;

  function showPurchaseNotification() {
    if (!purchaseToast) return;

    const buyer = buyers[currentBuyerIdx];
    buyerNameEl.textContent = buyer.name;
    buyerCityEl.textContent = buyer.city;
    buyerTimeEl.textContent = buyer.time;

    purchaseToast.classList.add('show');

    // Esconde após 4 segundos
    setTimeout(() => {
      purchaseToast.classList.remove('show');
    }, 4000);

    currentBuyerIdx = (currentBuyerIdx + 1) % buyers.length;
  }

  // Primeira notificação após 5 segundos, depois a cada 14 segundos
  setTimeout(() => {
    showPurchaseNotification();
    setInterval(showPurchaseNotification, 14000);
  }, 5000);

  /* ==========================================================================
     8. SMOOTH SCROLL PARA ANCHORS
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

});
