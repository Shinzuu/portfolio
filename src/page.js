var root = document.getElementById("sz8"), html = document.documentElement;
if (!document.title || /temporary/i.test(document.title)) document.title = root.dataset.title;
(function() {
  for (var el = root.parentElement; el && el !== document.body; el = el.parentElement) {
    var cs = getComputedStyle(el);
    if (cs.overflowX !== "visible" || cs.overflowY !== "visible") el.style.overflow = "visible";
  }
})();
root.querySelectorAll("a.em").forEach(function(a) {
  var m = a.dataset.u + "@" + a.dataset.d;
  a.href = "mailto:" + m;
  if (!a.hasAttribute("data-k")) a.textContent = m;
});
(function() {
  var fs = root.querySelectorAll("iframe[data-src]");
  function go(f) {
    if (!f.src) f.src = f.dataset.src;
  }
  if (!("IntersectionObserver" in window)) {
    fs.forEach(go);
    return;
  }
  var io = new IntersectionObserver(function(es) {
    es.forEach(function(x) {
      if (x.isIntersecting) {
        go(x.target);
        io.unobserve(x.target);
      }
    });
  }, { rootMargin: "600px 0px" });
  fs.forEach(function(f) {
    io.observe(f);
  });
})();
(function() {
  var MID = "[iFrameSizer]", KCUT = 18;
  function init2(f) {
    if (f.src) f.contentWindow.postMessage(MID + f.id + ":0:false:false:32:true:true:0:bodyOffset:transparent:null:0:false:parent:scroll:false", "*");
  }
  var fs = [].slice.call(root.querySelectorAll(".cbox iframe"));
  fs.forEach(function(f, i) {
    f.id = "sz8-w" + i;
    f.setAttribute("scrolling", "no");
    f.addEventListener("load", function() {
      init2(f);
    });
  });
  addEventListener("message", function(e) {
    if (!/leadconnectorhq\.com$/.test(e.origin) || typeof e.data !== "string") return;
    var f = fs.filter(function(x) {
      return x.contentWindow === e.source;
    })[0];
    if (e.data === "[iFrameResizerChild]Ready") {
      if (f) init2(f);
      return;
    }
    if (e.data.indexOf(MID) !== 0) return;
    var p = e.data.slice(MID.length).split(":"), h = Math.ceil(+p[1]);
    f = document.getElementById(p[0]) || f;
    if (!f || !(h > 200)) return;
    f.style.height = h + "px";
    if (f.classList.contains("k")) f.parentElement.style.height = h - 12 - KCUT + "px";
  });
})();
(function() {
  var cs = root.querySelectorAll("[data-clock]"), fc = root.querySelectorAll("[data-fclock]");
  if (!(cs.length + fc.length) || !window.Intl) return;
  var f = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: false });
  function tick() {
    var n = f.format(/* @__PURE__ */ new Date()), t = "Dhaka " + n + " · calls Mon & Tue, 7–10 pm";
    cs.forEach(function(c) {
      c.textContent = t;
    });
    fc.forEach(function(c) {
      c.textContent = "Chattogram " + n + " · GMT+6";
    });
  }
  tick();
  setInterval(tick, 3e4);
})();
var lenis = null;
(function() {
  var btn = root.querySelector("[data-menu]"), sheet = root.querySelector("#sz8-sheet");
  if (!btn || !sheet) return;
  var close = sheet.querySelector("[data-close]"), bg = [].filter.call(root.children, function(el) {
    return el !== sheet;
  });
  function open() {
    sheet.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    requestAnimationFrame(function() {
      sheet.classList.add("open");
    });
    if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      window.gsap.fromTo(sheet.querySelectorAll("nav a, .big, .sdir"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "expo.out", stagger: 0.05 });
    if (lenis) lenis.stop();
    html.style.overflow = "hidden";
    bg.forEach(function(el) {
      el.inert = true;
    });
    sheet.querySelector("nav a").focus();
  }
  function shut(focusBack) {
    sheet.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    html.style.overflow = "";
    bg.forEach(function(el) {
      el.inert = false;
    });
    if (lenis) lenis.start();
    setTimeout(function() {
      sheet.hidden = true;
    }, 250);
    if (focusBack) btn.focus();
  }
  btn.addEventListener("click", open);
  close.addEventListener("click", function() {
    shut(true);
  });
  sheet.addEventListener("click", function(e) {
    if (e.target.closest("a")) shut(false);
  });
  sheet.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      shut(true);
      return;
    }
    if (e.key !== "Tab") return;
    var f = sheet.querySelectorAll("a,button"), a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) {
      e.preventDefault();
      z.focus();
    } else if (!e.shiftKey && document.activeElement === z) {
      e.preventDefault();
      a.focus();
    }
  });
})();
(function() {
  var nav = root.querySelector(".nav"), on = null, q = false, work = nav.querySelector('a[href="#work"]'), secs = [root.querySelector(".feat"), root.querySelector(".idx")], spy = null;
  function check() {
    q = false;
    var b = scrollY > 8;
    if (b !== on) {
      on = b;
      nav.classList.toggle("bar", b);
    }
    var mid = innerHeight * 0.4, inW = secs.some(function(x) {
      if (!x) return false;
      var r = x.getBoundingClientRect();
      return r.top < mid && r.bottom > mid;
    });
    if (inW !== spy) {
      spy = inW;
      if (work) work.setAttribute("aria-current", inW ? "true" : "false");
    }
  }
  addEventListener("scroll", function() {
    if (!q) {
      q = true;
      requestAnimationFrame(check);
    }
  }, { passive: true });
  check();
})();
var capBox = root.querySelector(".caps"), caps = root.querySelectorAll(".caps p:not(.cnt)"), cnt = root.querySelector(".caps .cnt span"), capOn = -1, layer = root.querySelector(".layer"), lastP = -1;
function ss(x, a, b) {
  var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function setP(p) {
  window.__szP = p;
  if (Math.abs(p - lastP) > 2e-3) {
    lastP = p;
    layer.style.setProperty("--p", p.toFixed(3));
    layer.style.setProperty("--s2", ss(p, 0.64, 0.8).toFixed(3));
  }
  var s = p < 0.09 || p >= 0.97 ? -1 : p < 0.37 ? 0 : p < 0.64 ? 1 : 2;
  if (s === capOn) return;
  capOn = s;
  for (var i = 0; i < caps.length; i++) caps[i].classList.toggle("on", i === s);
  capBox.classList.toggle("go", s >= 0);
  if (cnt) cnt.textContent = "0" + (Math.max(s, 0) + 1);
}
var grid = root.querySelector(".grid"), items = grid ? [].slice.call(grid.children) : [], chips = root.querySelectorAll(".chip"), moreP = root.querySelector(".more"), filt = "all", all = false, allBtn = root.querySelector("[data-all]");
if (allBtn) allBtn.dataset.label = allBtn.textContent;
function layout() {
  items.forEach(function(li) {
    li.classList.toggle("off", filt !== "all" && li.dataset.g !== filt);
    li.classList.toggle("x", filt === "all" && !all && items.indexOf(li) >= 6);
  });
  solo();
  if (moreP) moreP.hidden = filt !== "all";
  if (allBtn) {
    allBtn.textContent = all ? "Show fewer" : allBtn.dataset.label;
    allBtn.setAttribute("aria-expanded", String(all));
  }
}
function solo() {
  var cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
  var vis = items.filter(function(li) {
    return !li.classList.contains("off") && !li.classList.contains("x");
  });
  items.forEach(function(li) {
    li.classList.remove("solo");
  });
  if (cols > 1 && vis.length % cols === 1) vis[vis.length - 1].classList.add("solo");
  grid.style.setProperty("--cols", cols);
}
if (grid) {
  solo();
  addEventListener("resize", function() {
    solo();
  });
}
function relayout(focusFirstNew) {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, gsap = window.gsap, Flip = window.Flip;
  var before = items.filter(function(li) {
    return li.offsetParent !== null;
  });
  if (gsap) {
    gsap.killTweensOf(items);
    gsap.set(items, { clearProps: "opacity,visibility,transform" });
  }
  if (gsap && Flip && !reduce) {
    var h0 = grid.offsetHeight, st = Flip.getState(items);
    grid.style.height = h0 + "px";
    layout();
    grid.style.height = "auto";
    var h1 = grid.offsetHeight;
    grid.style.height = Math.max(h0, h1) + "px";
    var tl = gsap.timeline({ onComplete: function() {
      grid.style.height = "";
      window.ScrollTrigger && window.ScrollTrigger.refresh();
    } });
    tl.add(Flip.from(st, {
      duration: 0.5,
      ease: "power3.inOut",
      absolute: true,
      scale: false,
      onEnter: function(els) {
        return gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.15 });
      },
      onLeave: function(els) {
        return gsap.to(els, { autoAlpha: 0, duration: 0.2 });
      }
    }), 0);
    if (h1 < h0) tl.to(grid, { height: h1, duration: 0.3, ease: "power2.out" }, 0.5);
  } else if (!reduce && grid.animate) {
    layout();
    grid.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: "ease-out" });
    window.ScrollTrigger && window.ScrollTrigger.refresh();
  } else {
    layout();
    window.ScrollTrigger && window.ScrollTrigger.refresh();
  }
  if (focusFirstNew) {
    var n = items.filter(function(li) {
      return li.offsetParent !== null && before.indexOf(li) < 0;
    })[0];
    var h = n && n.querySelector("h3");
    if (h) {
      h.tabIndex = -1;
      h.focus({ preventScroll: true });
    }
  }
}
chips.forEach(function(c) {
  c.addEventListener("click", function() {
    if (c.dataset.f === filt) return;
    filt = c.dataset.f;
    chips.forEach(function(x) {
      x.setAttribute("aria-pressed", String(x === c));
    });
    relayout(false);
  });
});
if (allBtn) allBtn.addEventListener("click", function() {
  all = !all;
  if (!all) {
    var top = root.querySelector(".idx").getBoundingClientRect().top;
    if (top < 0) lenis ? lenis.scrollTo("#index", { immediate: true }) : root.querySelector(".idx").scrollIntoView();
  }
  relayout(all);
});
root.querySelectorAll(".how").forEach(function(d) {
  var sm = d.querySelector("summary");
  sm.addEventListener("click", function(e) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    if (!d.open) {
      d.open = true;
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          d.classList.add("op");
        });
      });
    } else {
      d.classList.remove("op");
      setTimeout(function() {
        if (!d.classList.contains("op")) d.open = false;
        window.ScrollTrigger && window.ScrollTrigger.refresh();
      }, 460);
    }
  });
  d.addEventListener("toggle", function() {
    if (d.open) requestAnimationFrame(function() {
      d.classList.add("op");
    });
    else d.classList.remove("op");
    window.ScrollTrigger && window.ScrollTrigger.refresh();
  });
});
function revealAll() {
  var h = root.querySelector(".hl");
  if (h) h.classList.add("up");
}
var tries = 0;
(function wait() {
  if (window.gsap && window.ScrollTrigger && window.SplitText && window.Lenis && window.Flip) return init();
  if (++tries > 80) {
    revealAll();
    return;
  }
  setTimeout(wait, 50);
})();
function init() {
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger, SplitText = window.SplitText;
  gsap.registerPlugin(ScrollTrigger, SplitText, window.Flip);
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    lenis = new window.Lenis({ lerp: 0.08, smoothWheel: true, syncTouch: false, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function(t) {
      lenis.raf(t * 1e3);
    });
    gsap.ticker.lagSmoothing(0);
  }
  var mm = gsap.matchMedia();
  mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", function() {
    var off = [];
    function on(el, ev, fn) {
      el.addEventListener(ev, fn);
      off.push(function() {
        el.removeEventListener(ev, fn);
      });
    }
    html.classList.add("tilt");
    root.querySelectorAll(".card, .ic>article, .mk:not(.slot)>article").forEach(function(c) {
      var rx = gsap.quickTo(c, "rotationX", { duration: 0.6, ease: "power3.out" }), ry = gsap.quickTo(c, "rotationY", { duration: 0.6, ease: "power3.out" });
      gsap.set(c, { transformPerspective: 1400 });
      on(c, "pointermove", function(e) {
        var r = c.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        var max = c.classList.contains("card") ? 2 : 3;
        ry(nx * 2 * max);
        rx(-ny * 2 * max);
        c.style.setProperty("--mx", (nx + 0.5) * 100 + "%");
        c.style.setProperty("--my", (ny + 0.5) * 100 + "%");
      });
      on(c, "pointerleave", function() {
        rx(0);
        ry(0);
      });
    });
    root.querySelectorAll(".card .bf").forEach(function(f) {
      gsap.fromTo(f, { yPercent: 3 }, {
        yPercent: -3,
        ease: "none",
        scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
    root.querySelectorAll(".pill.red").forEach(function(b) {
      var qx = gsap.quickTo(b, "x", { duration: 0.4, ease: "power3.out" }), qy = gsap.quickTo(b, "y", { duration: 0.4, ease: "power3.out" });
      on(b, "pointermove", function(e) {
        var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        qx(Math.max(-6, Math.min(6, dx * 0.2)));
        qy(Math.max(-6, Math.min(6, dy * 0.3)));
      });
      on(b, "pointerleave", function() {
        qx(0);
        qy(0);
      });
    });
    return function() {
      off.forEach(function(f) {
        f();
      });
      html.classList.remove("tilt");
    };
  });
  mm.add({ isDesktop: "(min-width: 700px)", isMobile: "(max-width: 699px)", reduceMotion: "(prefers-reduced-motion: reduce)" }, function(ctx) {
    if (ctx.conditions.reduceMotion) {
      revealAll();
      return;
    }
    var lines = root.querySelectorAll(".hl .ln>span");
    gsap.set(lines, { y: 0, yPercent: 100 });
    root.querySelector(".hl").classList.add("up");
    gsap.to(lines, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay: 0.05 });
    gsap.to(root.querySelectorAll(".hc, .hud"), {
      autoAlpha: 0,
      y: -24,
      ease: "none",
      scrollTrigger: { trigger: root.querySelector(".stage"), start: "top top", end: "+=120", scrub: true }
    });
    gsap.fromTo(root.querySelector(".hero"), { "--scrim": 1 }, {
      "--scrim": 0,
      ease: "none",
      scrollTrigger: { trigger: root.querySelector(".stage"), start: "top top", end: "+=120", scrub: true }
    });
    if (!html.classList.contains("no3d")) {
      var prog = { p: 0 };
      gsap.to(prog, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: root.querySelector(".stage"), start: "top top", end: "bottom bottom", scrub: 0.6 },
        onUpdate: function() {
          setP(prog.p);
        }
      });
    }
    var below = function() {
      root.querySelectorAll("[data-split]").forEach(function(h) {
        SplitText.create(h, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: function(self) {
            return gsap.from(self.lines, { yPercent: 100, duration: 0.8, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: h, start: "top 88%", once: true } });
          }
        });
      });
      root.querySelectorAll(".card, .cbox, .mk, .skills").forEach(function(c) {
        gsap.from(c, { y: 32, autoAlpha: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 88%", once: true } });
      });
      var first = root.querySelectorAll(".ic:not(.x)");
      gsap.set(first, { y: 32, autoAlpha: 0 });
      ScrollTrigger.batch(first, {
        start: "top 90%",
        once: true,
        onEnter: function(b) {
          gsap.to(b, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.08, overwrite: true });
        }
      });
      root.querySelectorAll("[data-count]").forEach(function(b) {
        var to = +b.getAttribute("data-count"), suf = b.getAttribute("data-suf") || "", o = { v: 0 };
        b.textContent = "0" + suf;
        gsap.to(o, {
          v: to,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: { trigger: b, start: "top 92%", once: true },
          onUpdate: function() {
            b.textContent = Math.round(o.v).toLocaleString("en-US") + suf;
          }
        });
      });
      ScrollTrigger.refresh();
    };
    var idle = window.requestIdleCallback ? function(f) {
      return requestIdleCallback(f, { timeout: 1200 });
    } : function(f) {
      return setTimeout(f, 300);
    };
    idle(below);
  });
  Promise.all([document.fonts ? document.fonts.ready : 0, document.readyState === "complete" ? 0 : new Promise(function(r) {
    addEventListener("load", r, { once: true });
  })]).then(function() {
    ScrollTrigger.refresh();
  });
}
