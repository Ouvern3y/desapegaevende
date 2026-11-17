/**
 * Configuração centralizada da Landing Page — Chaveirinhos de Natal
 * Altere apenas a URL abaixo para conectar todos os botões de CTA ao seu checkout.
 */
window.APP_CONFIG = {
  // Link oficial do checkout Lowify
  CHECKOUT_URL: "https://pay.lowify.com.br/checkout?product_id=k9H1OU",

  // Se true, abre o checkout em uma nova aba; se false, abre na mesma aba
  OPEN_IN_NEW_TAB: false,

  // Prints reais de provas sociais (adicione ou remova caminhos conforme desejar)
  // Deixe os arquivos na pasta assets/ com estes nomes ou atualize os caminhos abaixo
  SOCIAL_PROOF_SLIDES: [
    {
      src: "assets/prova-social-1.webp",
      alt: "Depoimento no WhatsApp elogiando a facilidade e rapidez para fazer os chaveirinhos",
      label: "Depoimento real no WhatsApp #1"
    },
    {
      src: "assets/prova-social-2.webp",
      alt: "Depoimento no WhatsApp de professora agradecendo pelos moldes e atividade com os alunos",
      label: "Depoimento real no WhatsApp #2"
    }
  ]
};
