(function () {
  "use strict";

  const config = window.APP_CONFIG || {};

  /* ---------------------------------------------------------
     1. BOTÕES DE CHECKOUT E ROLAGEM PARA O CARD DE OFERTA
     --------------------------------------------------------- */
  function initCheckoutButtons() {
    const checkoutUrl = config.CHECKOUT_URL || "#";
    const openNewTab = Boolean(config.OPEN_IN_NEW_TAB);
    const buttons = document.querySelectorAll("[data-checkout-cta]");

    buttons.forEach((btn) => {
      btn.setAttribute("href", checkoutUrl);
      if (openNewTab) {
        btn.setAttribute("target", "_blank");
        btn.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  function initScrollToOfferButtons() {
    const scrollButtons = document.querySelectorAll("[data-scroll-to-offer], a[href='#oferta']");
    scrollButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = document.getElementById("oferta");
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* ---------------------------------------------------------
     2. SLOTS DE IMAGEM (FALLBACK LIMPO ATÉ AS FOTOS CHEGAREM)
     --------------------------------------------------------- */
  function createSlotPlaceholder(labelText) {
    const box = document.createElement("div");
    box.className = "img-slot-placeholder";
    box.innerHTML = `
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <span></span>
    `;
    box.querySelector("span").textContent = labelText;
    return box;
  }

  function attachImageFallback(img) {
    const handleError = () => {
      if (img.dataset.fallbackApplied === "true") return;
      img.dataset.fallbackApplied = "true";
      const label = img.dataset.slotLabel || img.alt || "Espaço reservado para imagem";
      const placeholder = createSlotPlaceholder(label);
      img.replaceWith(placeholder);
    };

    img.addEventListener("error", handleError);
    if (img.complete && img.naturalWidth === 0) {
      handleError();
    }
  }

  function initImageSlots() {
    document.querySelectorAll("img[data-slot-label]").forEach(attachImageFallback);
  }

  /* ---------------------------------------------------------
     3. CARROSSEL DE PROVAS SOCIAIS (DRAG-TO-SCROLL + SWIPE + SETAS + DOTS)
     --------------------------------------------------------- */
  function initCarousel() {
    const track = document.querySelector("[data-carousel-track]");
    const dotsContainer = document.querySelector("[data-carousel-dots]");
    const prevBtn = document.querySelector("[data-carousel-prev]");
    const nextBtn = document.querySelector("[data-carousel-next]");

    if (!track || !dotsContainer || !prevBtn || !nextBtn) return;

    const slidesData = Array.isArray(config.SOCIAL_PROOF_SLIDES) && config.SOCIAL_PROOF_SLIDES.length > 0
      ? config.SOCIAL_PROOF_SLIDES
      : [
          {
            src: "assets/prova-social-1.webp",
            alt: "Depoimento real no WhatsApp #1",
            label: "Depoimento real no WhatsApp #1"
          },
          {
            src: "assets/prova-social-2.webp",
            alt: "Depoimento real no WhatsApp #2",
            label: "Depoimento real no WhatsApp #2"
          }
        ];

    // Limpa conteúdo para garantir montagem correta
    track.innerHTML = "";
    dotsContainer.innerHTML = "";

    const slideElements = [];
    const dotElements = [];

    slidesData.forEach((item, index) => {
      const slide = document.createElement("div");
      slide.className = "carousel-slide";

      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || `Prova social ${index + 1}`;
      img.loading = index === 0 ? "eager" : "lazy";
      img.decoding = "async";
      img.setAttribute("draggable", "false");
      img.dataset.slotLabel = item.label || `Espaço para print real (${item.src})`;
      attachImageFallback(img);

      slide.appendChild(img);
      track.appendChild(slide);
      slideElements.push(slide);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot" + (index === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `Ir para mensagem ${index + 1}`);
      dot.addEventListener("click", () => scrollToSlide(index));
      dotsContainer.appendChild(dot);
      dotElements.push(dot);
    });

    let activeIndex = 0;
    let isDragging = false;

    function updateControls(index) {
      activeIndex = Math.max(0, Math.min(index, slideElements.length - 1));
      dotElements.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === activeIndex);
      });
      prevBtn.disabled = activeIndex === 0;
      nextBtn.disabled = activeIndex === slideElements.length - 1;
    }

    function scrollToSlide(index) {
      const clamped = Math.max(0, Math.min(index, slideElements.length - 1));
      const target = slideElements[clamped];
      if (!target) return;

      const offset = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
      track.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
      updateControls(clamped);
    }

    prevBtn.addEventListener("click", () => scrollToSlide(activeIndex - 1));
    nextBtn.addEventListener("click", () => scrollToSlide(activeIndex + 1));

    // Atualização em tempo real conforme rola
    let scrollTimer = null;
    track.addEventListener("scroll", () => {
      if (isDragging) return;
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;

        slideElements.forEach((slide, i) => {
          const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
          const dist = Math.abs(trackCenter - slideCenter);
          if (dist < closestDistance) {
            closestDistance = dist;
            closestIndex = i;
          }
        });

        updateControls(closestIndex);
      }, 50);
    }, { passive: true });

    /* ---------------------------------------------------------
       Mecânica de Arrastar / Rolar com Mouse (Drag-to-Scroll Desktop)
       --------------------------------------------------------- */
    let isMouseDown = false;
    let startX = 0;
    let scrollStart = 0;
    let totalMoved = 0;

    track.addEventListener("mousedown", (e) => {
      // Ignora clique direito/meio
      if (e.button !== 0) return;
      isMouseDown = true;
      isDragging = false;
      totalMoved = 0;
      startX = e.pageX - track.offsetLeft;
      scrollStart = track.scrollLeft;
      track.classList.add("is-dragging");
    });

    window.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;
      const x = e.pageX - track.offsetLeft;
      const walk = x - startX;
      totalMoved = walk;
      if (Math.abs(walk) > 5) {
        isDragging = true;
        track.scrollLeft = scrollStart - walk;
      }
    });

    window.addEventListener("mouseup", () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      track.classList.remove("is-dragging");

      if (isDragging) {
        // Se arrastou mais de 35px, avança ou volta; senão centraliza
        if (totalMoved < -35 && activeIndex < slideElements.length - 1) {
          scrollToSlide(activeIndex + 1);
        } else if (totalMoved > 35 && activeIndex > 0) {
          scrollToSlide(activeIndex - 1);
        } else {
          scrollToSlide(activeIndex);
        }
      }
      setTimeout(() => {
        isDragging = false;
      }, 50);
    });

    // Navegação via teclado para acessibilidade
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToSlide(activeIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollToSlide(activeIndex + 1);
      }
    });

    // Centraliza o slide ativo no redimensionamento da janela
    window.addEventListener("resize", () => {
      scrollToSlide(activeIndex);
    });

    // Centraliza o primeiro slide logo na inicialização
    window.requestAnimationFrame(() => {
      scrollToSlide(0);
    });
  }

  /* ---------------------------------------------------------
     4. FAQ ACCORDION
     --------------------------------------------------------- */
  function initFaq() {
    const items = document.querySelectorAll(".faq-item");

    items.forEach((item) => {
      const button = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      if (!button || !answer) return;

      button.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        if (isOpen) {
          item.classList.remove("is-open");
          button.setAttribute("aria-expanded", "false");
          answer.setAttribute("hidden", "");
        } else {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
          answer.removeAttribute("hidden");
        }
      });
    });
  }

  /* ---------------------------------------------------------
     5. CONTADOR DINÂMICO DE COMPRAS (17 -> 18 APÓS 5s EM TELA)
     --------------------------------------------------------- */
  function initLiveCounter() {
    const badge = document.querySelector(".offer-live-badge");
    const counterEl = document.querySelector("[data-live-counter]");

    if (!badge || !counterEl) return;

    let hasTriggered = false;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasTriggered) {
              hasTriggered = true;
              observer.disconnect();

              setTimeout(() => {
                counterEl.textContent = "18";
                counterEl.classList.add("is-updated");
              }, 5000);
            }
          });
        },
        { threshold: 0.25 }
      );

      observer.observe(badge);
    } else {
      setTimeout(() => {
        counterEl.textContent = "18";
        counterEl.classList.add("is-updated");
      }, 5000);
    }
  }

  /* ---------------------------------------------------------
     INICIALIZAÇÃO
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initCheckoutButtons();
    initScrollToOfferButtons();
    initImageSlots();
    initCarousel();
    initFaq();
    initLiveCounter();
  });
})();
