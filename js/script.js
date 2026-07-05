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

  // Botão flutuante "voltar ao topo"
  const backToTop = document.getElementById("backToTop");
  if (backToTop){
    window.addEventListener("scroll", () => {
      if (window.scrollY > 480){ backToTop.classList.add("show"); }
      else { backToTop.classList.remove("show"); }
    });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  // ===================== SCROLL REVEAL =====================
  // Marca cards e seções para animação de entrada suave
  document.querySelectorAll(".imovel-card, .cat-card, .lanc-card, .locacao-item, .spec-item")
    .forEach(el => el.classList.add("reveal"));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion && "IntersectionObserver" in window){
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add("show");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("show"));
  }

  // ===================== CONTADORES ANIMADOS =====================
  function animateCounter(el){
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();

    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll(".counter");
  if (counters.length){
    if (!prefersReducedMotion && "IntersectionObserver" in window){
      const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting){
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(el => counterObserver.observe(el));
    } else {
      counters.forEach(el => {
        el.textContent = (el.getAttribute("data-count") || "0") + (el.getAttribute("data-suffix") || "");
      });
    }
  }

  // ===================== FAVORITAR E COMPARTILHAR =====================
  // Favoritos salvos no navegador (localStorage)
  const FAV_KEY = "horizonte:favoritos";
  function getFavoritos(){
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch { return []; }
  }
  function salvarFavoritos(lista){
    try { localStorage.setItem(FAV_KEY, JSON.stringify(lista)); } catch {}
  }

  document.querySelectorAll(".imovel-card").forEach(card => {
    const meta = card.querySelector(".imovel-meta");
    if (!meta) return;

    const cardId = card.id || ("imovel-" + Math.random().toString(36).slice(2, 8));
    const titulo = card.querySelector("h3")?.textContent?.trim() || "este imóvel";

    const wrap = document.createElement("div");
    wrap.className = "imovel-meta-top";

    // botão favoritar
    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "card-icon-btn card-fav";
    favBtn.setAttribute("aria-label", "Favoritar imóvel: " + titulo);
    favBtn.textContent = getFavoritos().includes(cardId) ? "♥" : "♡";
    if (getFavoritos().includes(cardId)) favBtn.classList.add("is-fav");

    favBtn.addEventListener("click", () => {
      let favoritos = getFavoritos();
      if (favoritos.includes(cardId)){
        favoritos = favoritos.filter(id => id !== cardId);
        favBtn.classList.remove("is-fav");
        favBtn.textContent = "♡";
      } else {
        favoritos.push(cardId);
        favBtn.classList.add("is-fav");
        favBtn.textContent = "♥";
      }
      salvarFavoritos(favoritos);
    });

    // botão compartilhar
    const shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.className = "card-icon-btn card-share";
    shareBtn.setAttribute("aria-label", "Compartilhar imóvel: " + titulo);
    shareBtn.textContent = "↗";

    shareBtn.addEventListener("click", async () => {
      const shareData = {
        title: titulo,
        text: `Confira este imóvel na Horizonte Imóveis: ${titulo}`,
        url: window.location.href.split("#")[0] + "#" + cardId
      };
      if (navigator.share){
        try { await navigator.share(shareData); } catch {}
      } else {
        const link = encodeURIComponent(shareData.url);
        const texto = encodeURIComponent(shareData.text);
        window.open(`https://wa.me/?text=${texto}%20${link}`, "_blank", "noopener");
      }
    });

    wrap.appendChild(favBtn);
    wrap.appendChild(shareBtn);
    card.insertBefore(wrap, card.querySelector(".thumb").nextSibling);
  });

});