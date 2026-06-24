// =========================================================
// CONFIG — troque aqui o número de WhatsApp da imobiliária
// =========================================================
const WHATSAPP = {
  geral: "5541997075291", // formato: DDI+DDD+numero, sem espaços/símbolos
};

// Monta link do WhatsApp com mensagem pré-definida
function linkWhatsapp(numero, mensagem = "Olá! Vim pelo site e gostaria de mais informações sobre imóveis."){
  const texto = encodeURIComponent(mensagem);
  return `https://wa.me/${numero}?text=${texto}`;
}

document.addEventListener("DOMContentLoaded", () => {

  // Aplica os links de WhatsApp automaticamente em todo elemento marcado
  document.querySelectorAll("[data-wa]").forEach(el => {
    const numero = el.getAttribute("data-wa") || WHATSAPP.geral;
    const msg = el.getAttribute("data-wa-msg") || undefined;
    el.href = linkWhatsapp(numero, msg);
    el.target = "_blank";
    el.rel = "noopener";
  });

  // Menu mobile
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav){
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      const expanded = nav.classList.contains("open");
      toggle.setAttribute("aria-expanded", expanded);
    });
    nav.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        const isMegaParent = a.parentElement.classList.contains("has-mega");
        if (isMegaParent && window.innerWidth <= 720) return;
        nav.classList.remove("open");
      });
    });
  }

  // Mega menu mobile: toque no item-pai abre/fecha o submenu
  document.querySelectorAll(".has-mega > a").forEach(link => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 720){
        e.preventDefault();
        const parent = link.parentElement;
        const wasOpen = parent.classList.contains("open");
        document.querySelectorAll(".has-mega.open").forEach(li => li.classList.remove("open"));
        if (!wasOpen) parent.classList.add("open");
      }
    });
  });

  // Marca o link ativo conforme a seção visível
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".main-nav a[href^='#']");
  if (sections.length && navLinks.length){
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          navLinks.forEach(link => link.classList.remove("active"));
          const active = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
          if (active) active.classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px" });
    sections.forEach(s => observer.observe(s));
  }

  // Header sombra leve ao rolar
  const header = document.querySelector(".site-header");
  if (header){
    window.addEventListener("scroll", () => {
      if (window.scrollY > 8){ header.style.boxShadow = "0 8px 20px -12px rgba(0,0,0,.4)"; }
      else { header.style.boxShadow = "none"; }
    });
  }

  // Tabs de busca no hero (Comprar / Alugar / Lançamento)
  document.querySelectorAll(".stab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".stab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      // aqui você pode filtrar os imóveis conforme a tab ativa
      // por enquanto só troca o estilo visual
    });
  });

});