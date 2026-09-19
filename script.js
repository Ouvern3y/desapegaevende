/* ============================================================
   DESAPEGA & VENDE — SCRIPT VANILLA JS
   Simples, leve, sem bibliotecas externas
============================================================ */

// ============================================================
// CONFIGURAÇÃO CENTRALIZADA DO CHECKOUT
const CHECKOUT_URL = "https://pay.lowify.com.br/checkout?product_id=ibgL3q";

document.addEventListener("DOMContentLoaded", () => {
  // 1. GESTÃO CENTRALIZADA DOS BOTÕES DE CHECKOUT
  const checkoutButtons = document.querySelectorAll(".js-checkout");

  checkoutButtons.forEach((btn) => {
    // Se CHECKOUT_URL foi configurada com uma URL real, atualiza o href
    if (CHECKOUT_URL && CHECKOUT_URL !== "COLE_AQUI_O_LINK_DO_CHECKOUT") {
      if (btn.tagName.toLowerCase() === "a") {
        btn.setAttribute("href", CHECKOUT_URL);
      }
    }

    btn.addEventListener("click", (e) => {
      if (!CHECKOUT_URL || CHECKOUT_URL === "COLE_AQUI_O_LINK_DO_CHECKOUT") {
        e.preventDefault();
        console.warn(
          "[DESAPEGA & VENDE] Configure a variável CHECKOUT_URL no arquivo script.js com o link de checkout do produto."
        );
        // Em ambiente de teste/validação, exibe aviso amigável se a URL ainda não foi inserida
        alert(
          "Link de checkout em configuração. Para ativar, insira a URL na constante CHECKOUT_URL dentro de script.js."
        );
      } else {
        // Dispara evento InitiateCheckout no Meta Pixel
        if (typeof window.fbq === "function") {
          window.fbq("track", "InitiateCheckout", {
            content_name: "Guia Digital DESAPEGA & VENDE",
            value: 9.90,
            currency: "BRL"
          });
        }

        // Se for botão comum (não link), redireciona
        if (btn.tagName.toLowerCase() !== "a") {
          window.location.href = CHECKOUT_URL;
        }
      }
    });
  });

  // 2. STICKY MOBILE CTA BAR (Aparece após rolar o Hero e oculta quando a oferta estiver visível)
  const stickyBar = document.getElementById("sticky-mobile-cta");
  const stickyClose = document.getElementById("sticky-close-btn");
  const heroSection = document.querySelector(".hero");
  const offerSection = document.getElementById("oferta");
  let stickyDismissed = false;
  let isOfferInViewport = false;
  let isHeroPast = false;

  const updateStickyBar = () => {
    if (stickyDismissed || !stickyBar) return;
    if (window.innerWidth > 768) {
      stickyBar.classList.remove("is-active");
      return;
    }
    if (isHeroPast && !isOfferInViewport) {
      stickyBar.classList.add("is-active");
    } else {
      stickyBar.classList.remove("is-active");
    }
  };

  if (stickyBar && heroSection) {
    window.addEventListener("resize", updateStickyBar, { passive: true });

    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isHeroPast = !entry.isIntersecting;
            updateStickyBar();
          });
        },
        { threshold: 0.1 }
      );
      heroObserver.observe(heroSection);

      if (offerSection) {
        const offerObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              isOfferInViewport = entry.isIntersecting;
              updateStickyBar();
              const purchasePopup = document.getElementById("purchase-popup");
              if (isOfferInViewport && purchasePopup) {
                purchasePopup.classList.remove("is-visible");
              }
            });
          },
          { threshold: 0.08 }
        );
        offerObserver.observe(offerSection);
      }
    } else {
      const handleScroll = () => {
        if (stickyDismissed) return;
        const heroRect = heroSection.getBoundingClientRect();
        const offerRect = offerSection ? offerSection.getBoundingClientRect() : null;
        isHeroPast = heroRect.bottom < 80;
        isOfferInViewport = offerRect ? (offerRect.top < window.innerHeight && offerRect.bottom > 60) : false;
        updateStickyBar();
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    if (stickyClose) {
      stickyClose.addEventListener("click", () => {
        stickyBar.classList.remove("is-active");
        stickyDismissed = true;
      });
    }
  }

  // 3. FAQ ACCORDION SUAVE (OPCIONAL: Fecha outros ao abrir um)
  const faqItems = document.querySelectorAll(".faq-entry, .faq-item");
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

  // 4. ROLAGEM SUAVE DE TODOS OS BOTÕES SECUNDÁRIOS PARA O CARD DE OFERTA
  const scrollOfertaButtons = document.querySelectorAll(".js-scroll-oferta");
  scrollOfertaButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetCard = document.getElementById("card-oferta") || document.getElementById("oferta");
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
        targetCard.classList.add("highlight-pulse");
        setTimeout(() => {
          targetCard.classList.remove("highlight-pulse");
        }, 1100);
      }
    });
  });

  // 5. DATA DINÂMICA NA FAIXA DE URGÊNCIA DE TOPO (SOMENTE HOJE)
  const dataUrgenciaEl = document.getElementById("data-urgencia");
  if (dataUrgenciaEl) {
    const hoje = new Date();
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    const dia = hoje.getDate();
    const mes = meses[hoje.getMonth()].toUpperCase();
    const textoData = `${dia} DE ${mes}`;

    dataUrgenciaEl.textContent = textoData;
    try {
      dataUrgenciaEl.setAttribute("datetime", hoje.toISOString().split("T")[0]);
    } catch (err) {}
  }

  // 6. POP-UP DE PROVA SOCIAL COM COMPRAS RECENTES
  const purchasePopup = document.getElementById("purchase-popup");
  const buyerNameEl = document.getElementById("popup-buyer-name");
  const buyerLocationEl = document.getElementById("popup-buyer-location");
  const timeTextEl = document.getElementById("popup-time-text");
  const popupCloseBtn = document.getElementById("popup-close-btn");

  if (purchasePopup && buyerNameEl && buyerLocationEl && timeTextEl) {
    // 95% nomes femininos, raríssimos masculinos (1 em 20 = 5%)
    const compradores = [
      { nome: "Camila S.", local: "São Paulo - SP" },
      { nome: "Mariana R.", local: "Belo Horizonte - MG" },
      { nome: "Beatriz L.", local: "Curitiba - PR" },
      { nome: "Juliana M.", local: "Rio de Janeiro - RJ" },
      { nome: "Fernanda C.", local: "Campinas - SP" },
      { nome: "Larissa D.", local: "Porto Alegre - RS" },
      { nome: "Patrícia A.", local: "Salvador - BA" },
      { nome: "Carolina B.", local: "Goiânia - GO" },
      { nome: "Renata O.", local: "Florianópolis - SC" },
      { nome: "Lucas F.", local: "São José dos Campos - SP" }, // ~5% masculino
      { nome: "Aline F.", local: "Fortaleza - CE" },
      { nome: "Bruna S.", local: "Santos - SP" },
      { nome: "Gabriela T.", local: "Brasília - DF" },
      { nome: "Vanessa P.", local: "Recife - PE" },
      { nome: "Jéssica M.", local: "Ribeirão Preto - SP" },
      { nome: "Amanda V.", local: "Vitória - ES" },
      { nome: "Letícia G.", local: "Maringá - PR" },
      { nome: "Luana K.", local: "Joinville - SC" },
      { nome: "Daniela N.", local: "Niterói - RJ" },
      { nome: "Priscila H.", local: "Sorocaba - SP" }
    ];

    let currentIndex = Math.floor(Math.random() * compradores.length);
    let popupTimeoutId = null;
    let popupDismissedTemporarily = false;

    const gerarTempoAtras = () => {
      const min = Math.floor(Math.random() * 11) + 2; // 2 a 12 minutos
      const seg = Math.floor(Math.random() * 50) + 10; // 10 a 59 segundos
      return `${min} minutos e ${seg} segundos atrás`;
    };

    const showNextPopup = () => {
      if (popupDismissedTemporarily) return;

      const isMobile = window.innerWidth <= 768;
      const isStickyActive = stickyBar && stickyBar.classList.contains("is-active");

      // No mobile, se o usuário estiver na seção de oferta ou se a barra fixa de compra estiver ativa, pausa
      if (isOfferInViewport || (isMobile && isStickyActive)) {
        setTimeout(showNextPopup, 4500);
        return;
      }

      const comprador = compradores[currentIndex];
      buyerNameEl.textContent = comprador.nome;
      buyerLocationEl.textContent = comprador.local;
      timeTextEl.textContent = gerarTempoAtras();

      purchasePopup.classList.add("is-visible");
      currentIndex = (currentIndex + 1) % compradores.length;

      // Permanece visível por 4.5 segundos
      popupTimeoutId = setTimeout(() => {
        purchasePopup.classList.remove("is-visible");

        // Intervalo entre 8 a 13 segundos para o próximo pop-up
        const nextDelay = Math.floor(Math.random() * 5000) + 8000;
        setTimeout(showNextPopup, nextDelay);
      }, 4500);
    };

    // Primeira exibição aos 8.5 segundos após abrir a página
    setTimeout(showNextPopup, 8500);

    if (popupCloseBtn) {
      popupCloseBtn.addEventListener("click", () => {
        purchasePopup.classList.remove("is-visible");
        clearTimeout(popupTimeoutId);
        popupDismissedTemporarily = true;
        // Reativa após 25 segundos se fechado manualmente
        setTimeout(() => {
          popupDismissedTemporarily = false;
          showNextPopup();
        }, 25000);
      });
    }
  }

  // 7. CRONÔMETRO DE 15 MINUTOS & CONTADOR DE COMPRADORES 24H
  const countdownMinEl = document.getElementById("countdown-min");
  const countdownSecEl = document.getElementById("countdown-sec");
  const buyersCount24hEl = document.getElementById("buyers-count-24h");

  // Contador de compradores nas últimas 24h (entre 50 e 90 pessoas)
  if (buyersCount24hEl) {
    let buyers24h = sessionStorage.getItem("desapega_buyers_24h");
    if (!buyers24h) {
      // Sorteia número realista entre 68 e 88
      buyers24h = Math.floor(Math.random() * 21) + 68;
      sessionStorage.setItem("desapega_buyers_24h", buyers24h);
    }
    buyersCount24hEl.textContent = `${buyers24h} pessoas`;
  }

  // Cronômetro de 15 minutos persistente na sessão
  if (countdownMinEl && countdownSecEl) {
    const DURATION_MS = 15 * 60 * 1000; // 15 minutos em ms
    let timerEnd = sessionStorage.getItem("desapega_timer_15m");

    if (!timerEnd || isNaN(timerEnd) || Number(timerEnd) <= Date.now()) {
      timerEnd = Date.now() + DURATION_MS;
      sessionStorage.setItem("desapega_timer_15m", timerEnd);
    } else {
      timerEnd = Number(timerEnd);
    }

    const updateCountdown = () => {
      let remaining = Math.max(0, Math.floor((timerEnd - Date.now()) / 1000));

      if (remaining <= 0) {
        // Reinicia ciclo caso expire durante navegação contínua
        timerEnd = Date.now() + DURATION_MS;
        sessionStorage.setItem("desapega_timer_15m", timerEnd);
        remaining = 15 * 60;
      }

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;

      countdownMinEl.textContent = String(minutes).padStart(2, "0");
      countdownSecEl.textContent = String(seconds).padStart(2, "0");
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // 8. FADE-UP SUAVE PARA OS CARDS DE IDENTIFICAÇÃO / PROVA SOCIAL
  const socialCards = document.querySelectorAll(".social-proof-card");
  if (socialCards.length > 0) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      socialCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 100}ms`;
        observer.observe(card);
      });
    } else {
      socialCards.forEach((card) => card.classList.add("is-visible"));
    }
  }

  // 9. INTERATIVIDADE DOS COMENTÁRIOS (CURTIR COM PREENCHIMENTO + CONTADOR)
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

  // 10. CARROSSEL INTERATIVO DO MATERIAL (SLIDES 1 A 4)
  const carouselTrack = document.getElementById("previewCarouselTrack");
  const prevBtn = document.querySelector(".js-preview-prev");
  const nextBtn = document.querySelector(".js-preview-next");
  const dots = document.querySelectorAll(".preview-dot");
  const counterEl = document.getElementById("previewCounter");

  if (carouselTrack && prevBtn && nextBtn) {
    const slides = carouselTrack.querySelectorAll(".preview-slide");
    const totalSlides = slides.length;
    let currentSlide = 0;

    const goToSlide = (index) => {
      if (index < 0) {
        currentSlide = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentSlide = 0;
      } else {
        currentSlide = index;
      }

      carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

      dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.classList.add("is-active");
          dot.setAttribute("aria-current", "true");
        } else {
          dot.classList.remove("is-active");
          dot.removeAttribute("aria-current");
        }
      });

      if (counterEl) {
        counterEl.textContent = `${currentSlide + 1} / ${totalSlides}`;
      }
    };

    prevBtn.addEventListener("click", () => {
      goToSlide(currentSlide - 1);
    });

    nextBtn.addEventListener("click", () => {
      goToSlide(currentSlide + 1);
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const targetIndex = parseInt(dot.getAttribute("data-index"), 10);
        if (!isNaN(targetIndex)) {
          goToSlide(targetIndex);
        }
      });
    });

    // Suporte a gestos touch (swipe no celular)
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    carouselTrack.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchStartX - touchEndX;
        if (Math.abs(diffX) > 40) {
          if (diffX > 0) {
            goToSlide(currentSlide + 1);
          } else {
            goToSlide(currentSlide - 1);
          }
        }
      },
      { passive: true }
    );

    const carouselWrap = document.querySelector(".preview-carousel-wrap");
    if (carouselWrap) {
      carouselWrap.setAttribute("tabindex", "0");
      carouselWrap.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          goToSlide(currentSlide - 1);
        } else if (e.key === "ArrowRight") {
          goToSlide(currentSlide + 1);
        }
      });
    }
  }
});

