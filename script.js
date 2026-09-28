/* ============================================================
   KIT FALA CLARA — JAVASCRIPT VANILLA
   Leve, modular, sem dependências externas
   Componentes: Carrossel Touch, Accordion FAQ, Sticky CTA & Config
============================================================ */

// 1. CONFIGURAÇÕES CENTRALIZADAS DO PRODUTO (PLACEHOLDERS CONFIGURÁVEIS)
const PRODUCT_CONFIG = {
  // Substitua pelo valor de venda desejado ou integre com checkout dinâmico
  PRICE_MAIN: "R$ 19,90", // [VALOR CONFIGURÁVEL]
  CHECKOUT_URL: "https://pay.wiapy.com/o6-U_yXX2OPx", // [LINK_CHECKOUT COMPLETO]
  CHECKOUT_URL_BASIC: "https://pay.wiapy.com/_mNXvU3QkaX6", // [LINK_CHECKOUT BÁSICO]
  AGE_RANGE: "crianças de 3 a 7 anos (em fase de aquisição e desenvolvimento dos sons da fala)", // [IDADE]
  SUPPORT_EMAIL: "suporte@kitfalaclara.com.br" // [SUPORTE]
};

document.addEventListener("DOMContentLoaded", () => {
  // 2. INJEÇÃO DE DADOS CONFIGURÁVEIS
  const priceMainEl = document.getElementById("config-price-main");
  const ageRangeEls = document.querySelectorAll(".config-age-range");
  const supportEmailEls = document.querySelectorAll(".config-support-email");

  if (priceMainEl) priceMainEl.textContent = PRODUCT_CONFIG.PRICE_MAIN;
  
  ageRangeEls.forEach(el => {
    el.textContent = PRODUCT_CONFIG.AGE_RANGE;
  });

  supportEmailEls.forEach(el => {
    el.textContent = PRODUCT_CONFIG.SUPPORT_EMAIL;
    if (el.tagName.toLowerCase() === "a") {
      el.setAttribute("href", `mailto:${PRODUCT_CONFIG.SUPPORT_EMAIL}`);
    }
  });

  // 3. GESTÃO DOS BOTÕES DE CHECKOUT
  const checkoutButtons = document.querySelectorAll(".js-checkout");
  checkoutButtons.forEach((btn) => {
    const isBasic = Boolean(btn.closest(".basic-offer-card"));
    const targetUrl = isBasic ? PRODUCT_CONFIG.CHECKOUT_URL_BASIC : PRODUCT_CONFIG.CHECKOUT_URL;
    if (targetUrl && targetUrl !== "#checkout-link") {
      if (btn.tagName.toLowerCase() === "a") {
        btn.setAttribute("href", targetUrl);
      }
    }

    btn.addEventListener("click", (e) => {
      // Dispara evento de InitiateCheckout no Meta Pixel
      if (typeof fbq === "function") {
        const isBasic = Boolean(btn.closest(".basic-offer-card"));
        fbq("track", "InitiateCheckout", {
          content_name: isBasic ? "KIT FALA CLARA BÁSICO" : "KIT FALA CLARA COMPLETO",
          value: isBasic ? 9.90 : 19.90,
          currency: "BRL"
        });
      }

      if (!PRODUCT_CONFIG.CHECKOUT_URL || PRODUCT_CONFIG.CHECKOUT_URL === "#checkout-link") {
        // Se ainda for o placeholder, rola suavemente até o card de oferta ou alerta desenvolvedor
        if (btn.getAttribute("href") === "#oferta") {
          // Deixa seguir a ancoragem
          return;
        }
        e.preventDefault();
        const targetOferta = document.getElementById("oferta");
        if (targetOferta) {
          targetOferta.scrollIntoView({ behavior: "smooth", block: "start" });
          targetOferta.classList.add("highlight-pulse");
          setTimeout(() => targetOferta.classList.remove("highlight-pulse"), 1000);
        }
      }
    });
  });

  // 4. ROLAGEM SUAVE PARA O TOPO DO KIT FALA CLARA BÁSICO (TODOS OS CTAS EXCETO OS CARDS DE VENDAS)
  const ctaScrollBtns = document.querySelectorAll(
    ".js-scroll-oferta, a[href='#kitBasico'], a[href='#urgencyAlertBox'], a[href='#oferta']:not(.boutique-offer-card a):not(.basic-offer-card a)"
  );
  ctaScrollBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetBasico = document.getElementById("kitBasico") || document.getElementById("oferta");
      if (targetBasico) {
        targetBasico.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // 5. CARROSSEL TOUCH-FRIENDLY ("VEJA O KIT POR DENTRO")
  const track = document.getElementById("carouselTrack");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  const dots = document.querySelectorAll(".carousel-dot");
  const counter = document.getElementById("carouselCounter");

  if (track && prevBtn && nextBtn) {
    const slides = track.querySelectorAll(".carousel-slide");
    const totalSlides = slides.length;
    let currentSlide = 0;

    const updateCarousel = (index) => {
      if (index < 0) {
        currentSlide = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentSlide = 0;
      } else {
        currentSlide = index;
      }

      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      // Atualiza Dots
      dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.classList.add("is-active");
          dot.setAttribute("aria-current", "true");
        } else {
          dot.classList.remove("is-active");
          dot.removeAttribute("aria-current");
        }
      });

      // Atualiza Contador Numérico
      if (counter) {
        counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
      }
    };

    prevBtn.addEventListener("click", () => updateCarousel(currentSlide - 1));
    nextBtn.addEventListener("click", () => updateCarousel(currentSlide + 1));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const slideIndex = parseInt(dot.getAttribute("data-index"), 10);
        if (!isNaN(slideIndex)) {
          updateCarousel(slideIndex);
        }
      });
    });

    // Alinhamento exato das setas no centro vertical da imagem do carrossel
    const updateArrowsPosition = () => {
      const firstSlideImg = track.querySelector(".carousel-slide img");
      if (firstSlideImg && prevBtn && nextBtn) {
        const imgHeight = firstSlideImg.offsetHeight;
        if (imgHeight > 0) {
          const topPos = Math.round(imgHeight / 2);
          prevBtn.style.top = `${topPos}px`;
          nextBtn.style.top = `${topPos}px`;
        }
      }
    };

    updateArrowsPosition();
    window.addEventListener("resize", updateArrowsPosition);
    const firstImg = track.querySelector(".carousel-slide img");
    if (firstImg) {
      if (firstImg.complete) {
        updateArrowsPosition();
      } else {
        firstImg.addEventListener("load", updateArrowsPosition);
      }
    }

    // Gestos Touch (Swipe no Mobile)
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    track.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchStartX - touchEndX;
        // Limiar de swipe: 35px
        if (Math.abs(diffX) > 35) {
          if (diffX > 0) {
            updateCarousel(currentSlide + 1); // Deslize para a esquerda -> próximo
          } else {
            updateCarousel(currentSlide - 1); // Deslize para a direita -> anterior
          }
        }
      },
      { passive: true }
    );

    // Navegação via teclado para acessibilidade
    const carouselSection = document.querySelector(".carousel-section");
    if (carouselSection) {
      carouselSection.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          updateCarousel(currentSlide - 1);
        } else if (e.key === "ArrowRight") {
          updateCarousel(currentSlide + 1);
        }
      });
    }
  }

  // 6. ACCORDION FAQ SUAVE (FECHA OUTROS ITENS AO ABRIR UM)
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item && other.open) {
            other.removeAttribute("open");
          }
        });
      }
    });
  });

  // 7. INTERATIVIDADE DOS COMENTÁRIOS DE PROVA SOCIAL (CURTIR + CONTADOR)
  const fbLikeButtons = document.querySelectorAll(".js-fb-like");
  fbLikeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isLiked = btn.classList.toggle("is-liked");
      const countEl = btn.querySelector(".fb-like-count");
      if (countEl) {
        const baseCount = parseInt(countEl.getAttribute("data-base-count"), 10) || 10;
        countEl.textContent = isLiked ? baseCount + 1 : baseCount;
      }
    });
  });

  // 8. CONTADOR DINÂMICO DE ESCASSEZ / URGÊNCIA (6 -> 5 APÓS 3 SEGUNDOS VISÍVEL)
  const urgencyBox = document.getElementById("urgencyAlertBox");
  const urgencyCountEl = document.getElementById("urgencyKitsCount");

  if (urgencyBox && urgencyCountEl) {
    let countdownTriggered = false;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !countdownTriggered) {
              countdownTriggered = true;
              // 3 segundos após a área ficar visível na tela
              setTimeout(() => {
                urgencyCountEl.classList.add("count-pop");
                urgencyCountEl.textContent = "5";
                setTimeout(() => {
                  urgencyCountEl.classList.remove("count-pop");
                }, 400);
              }, 3000);
              observer.unobserve(urgencyBox);
            }
          });
        },
        { threshold: 0.25 }
      );
      observer.observe(urgencyBox);
    } else {
      setTimeout(() => {
        urgencyCountEl.textContent = "5";
      }, 3000);
    }
  }
});

