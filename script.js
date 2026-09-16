/* ============================================================
   DESAPEGA & VENDE — SCRIPT VANILLA JS
   Simples, leve, sem bibliotecas externas
============================================================ */

// ============================================================
// CONFIGURAÇÃO CENTRALIZADA DO CHECKOUT
// Cole abaixo o link da sua plataforma de pagamento (ex: Kiwify, Hotmart, Eduzz, etc.)
// ============================================================
const CHECKOUT_URL = "COLE_AQUI_O_LINK_DO_CHECKOUT";

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
        // Se for botão comum (não link), redireciona
        if (btn.tagName.toLowerCase() !== "a") {
          window.location.href = CHECKOUT_URL;
        }
      }
    });
  });

  // 2. STICKY MOBILE CTA BAR (Aparece após rolar o Hero)
  const stickyBar = document.getElementById("sticky-mobile-cta");
  const stickyClose = document.getElementById("sticky-close-btn");
  const heroSection = document.querySelector(".hero");
  let stickyDismissed = false;

  if (stickyBar && heroSection) {
    const handleScroll = () => {
      if (stickyDismissed) return;

      const heroRect = heroSection.getBoundingClientRect();
      // Mostra a barra quando o final do Hero estiver saindo do topo da tela
      if (heroRect.bottom < 100) {
        stickyBar.classList.add("is-active");
      } else {
        stickyBar.classList.remove("is-active");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

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

  // 5. DATA DINÂMICA NA FAIXA DE URGÊNCIA (SOMENTE HOJE)
  const dataUrgenciaEl = document.getElementById("data-urgencia");
  if (dataUrgenciaEl) {
    const hoje = new Date();
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    const dia = hoje.getDate();
    const mes = meses[hoje.getMonth()].toUpperCase();
    dataUrgenciaEl.textContent = `${dia} DE ${mes}`;
    try {
      dataUrgenciaEl.setAttribute("datetime", hoje.toISOString().split("T")[0]);
    } catch (err) {
      // noop
    }
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

      const comprador = compradores[currentIndex];
      buyerNameEl.textContent = comprador.nome;
      buyerLocationEl.textContent = comprador.local;
      timeTextEl.textContent = gerarTempoAtras();

      purchasePopup.classList.add("is-visible");
      currentIndex = (currentIndex + 1) % compradores.length;

      // Permanece visível por 5 segundos
      popupTimeoutId = setTimeout(() => {
        purchasePopup.classList.remove("is-visible");

        // Intervalo entre 8 a 13 segundos para o próximo pop-up
        const nextDelay = Math.floor(Math.random() * 5000) + 8000;
        setTimeout(showNextPopup, nextDelay);
      }, 5000);
    };

    // Primeira exibição aos 3.5 segundos após abrir a página
    setTimeout(showNextPopup, 3500);

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
});

