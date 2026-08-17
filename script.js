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
