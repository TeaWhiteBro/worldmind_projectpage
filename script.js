(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const trace = document.querySelector(".trace");
  const traceRows = Array.from(document.querySelectorAll("[data-trace]"));
  let traceIndex = 0;
  let traceTimer = null;

  const setTrace = (index) => {
    traceIndex = index;
    traceRows.forEach((row, rowIndex) => {
      const isActive = rowIndex === index;
      row.classList.toggle("is-active", isActive);
      row.setAttribute("aria-pressed", String(isActive));
    });
  };

  const stopTrace = () => {
    if (traceTimer) {
      window.clearInterval(traceTimer);
      traceTimer = null;
    }
  };

  const startTrace = () => {
    stopTrace();
    if (prefersReducedMotion.matches || document.hidden) return;
    traceTimer = window.setInterval(() => {
      setTrace((traceIndex + 1) % traceRows.length);
    }, 1650);
  };

  if (trace && traceRows.length) {
    traceRows.forEach((row, index) => {
      row.addEventListener("click", () => {
        setTrace(index);
        startTrace();
      });
    });

    trace.addEventListener("pointerenter", stopTrace);
    trace.addEventListener("pointerleave", startTrace);
    trace.addEventListener("focusin", stopTrace);
    trace.addEventListener("focusout", (event) => {
      if (!trace.contains(event.relatedTarget)) startTrace();
    });
    document.addEventListener("visibilitychange", startTrace);
    prefersReducedMotion.addEventListener?.("change", startTrace);
    startTrace();
  }

  const judgeData = {
    gpt: {
      "pref-implicit": "71.5%",
      "pref-external": "70.9%",
      "valid-ours": "74.0%",
      "segment-ours": "3.85 / 5",
      "valid-implicit": "63.6%",
      "segment-implicit": "3.28 / 5",
      "valid-external": "63.6%",
      "segment-external": "3.22 / 5"
    },
    gemini: {
      "pref-implicit": "69.8%",
      "pref-external": "70.3%",
      "valid-ours": "77.6%",
      "segment-ours": "4.00 / 5",
      "valid-implicit": "70.6%",
      "segment-implicit": "3.20 / 5",
      "valid-external": "70.9%",
      "segment-external": "3.17 / 5"
    }
  };

  const judgeButtons = Array.from(document.querySelectorAll("[data-judge]"));
  const valueNodes = Array.from(document.querySelectorAll("[data-value]"));

  judgeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedJudge = button.dataset.judge;
      const selectedData = judgeData[selectedJudge];
      if (!selectedData) return;

      judgeButtons.forEach((candidate) => {
        const isSelected = candidate === button;
        candidate.classList.toggle("is-active", isSelected);
        candidate.setAttribute("aria-selected", String(isSelected));
      });

      valueNodes.forEach((node) => {
        const value = selectedData[node.dataset.value];
        if (value) node.textContent = value;
      });
    });
  });

  const navLinks = Array.from(document.querySelectorAll(".nav a"));
  const observedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === `#${visible.target.id}`
          );
        });
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0, 0.15, 0.4]
      }
    );

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  const copyCitationButton = document.querySelector("[data-copy-citation]");
  const citationText = document.querySelector("[data-citation-text]");

  if (copyCitationButton && citationText) {
    copyCitationButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(citationText.textContent.trim());
        copyCitationButton.textContent = "Copied";
        window.setTimeout(() => {
          copyCitationButton.textContent = "Copy BibTeX";
        }, 1800);
      } catch {
        copyCitationButton.textContent = "Select text to copy";
      }
    });
  }
})();

/* 分拍播放器:第一拍播完停在尾帧并提示,再点第二拍 */
(() => {
  const root = document.querySelector("[data-beats]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll("[data-clip]"));
  const panels = Array.from(root.querySelectorAll("[data-clip-panel]"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach((p) => {
        const on = p.dataset.clipPanel === tab.dataset.clip;
        p.classList.toggle("is-active", on);
        p.hidden = !on;
        if (!on) {
          const v = p.querySelector("[data-beat-video]");
          if (v) v.pause();
        } else {
          reset(p);
        }
      });
    });
  });

  function reset(panel) {
    setBeat(panel, 1, false);
  }

  function setBeat(panel, n, play) {
    const video = panel.querySelector("[data-beat-video]");
    const seam = panel.querySelector("[data-seam]");
    if (!video) return;

    video.pause();
    video.poster = video.dataset["p" + n];
    video.src = video.dataset["b" + n];
    video.load();
    if (seam) seam.hidden = true;

    panel.querySelectorAll(".beat").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.beat === String(n));
    });
    panel.querySelectorAll("[data-beat-play]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.beatPlay === String(n));
    });

    if (play) {
      const go = () => video.play().catch(() => {});
      if (video.readyState >= 2) go();
      else video.addEventListener("loadeddata", go, { once: true });
    }
  }

  panels.forEach((panel) => {
    const video = panel.querySelector("[data-beat-video]");
    const seam = panel.querySelector("[data-seam]");
    if (!video) return;

    let chain = false;

    panel.querySelectorAll("[data-beat-play]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const which = btn.dataset.beatPlay;
        if (which === "all") {
          chain = true;
          setBeat(panel, 1, true);
        } else {
          chain = false;
          setBeat(panel, Number(which), true);
        }
      });
    });

    video.addEventListener("ended", () => {
      const onBeat1 = video.currentSrc.endsWith(video.dataset.b1.replace("./", ""));
      if (!onBeat1) return;
      if (seam) seam.hidden = false;          // 停在尾帧,点出交接
      if (chain) {
        window.setTimeout(() => {
          if (seam) seam.hidden = true;
          setBeat(panel, 2, true);
        }, 1600);
      }
    });
  });
})();
