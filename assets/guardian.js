(() => {
  "use strict";

  const STORAGE_KEY = "uhhGuardianProfile";
  const $ = (id) => document.getElementById(id);

  function readProfile() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
    } catch {
      return {};
    }
  }

  function writeProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  }

  function announce(node, message, kind = "") {
    if (!node) return;
    node.textContent = message;
    node.className = `field-status${kind ? ` ${kind}` : ""}`;
  }

  function bringIntoView(node) {
    if (!node) return;
    if (typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (typeof node.focus === "function") node.focus({ preventScroll: true });
  }

  function initWelcome() {
    const form = $("guardianOnboarding");
    if (!form) return;

    const nameInput = $("name");
    const goalInput = $("goal");
    const supportInput = $("support");
    const options = $("options");
    const status = $("onboardingStatus");
    const saved = readProfile();

    if (saved.name) nameInput.value = saved.name;
    if (saved.goal) goalInput.value = saved.goal;
    if (saved.support) supportInput.value = saved.support;

    function makePathCard(path) {
      const article = document.createElement("article");
      article.className = "card";

      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = "Suggested starter path";

      const heading = document.createElement("h3");
      heading.textContent = path.title;

      const reason = document.createElement("p");
      reason.textContent = path.reason;

      const list = document.createElement("ul");
      list.className = "clean";
      path.features.forEach((feature) => {
        const item = document.createElement("li");
        item.textContent = feature;
        list.appendChild(item);
      });

      const price = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = "Price: ";
      price.append(
        strong,
        "Under review; final pricing will be shown before any real purchase.",
      );

      const choose = document.createElement("a");
      choose.className = "btn btn-secondary choose";
      choose.href = "member-home.html";
      choose.dataset.path = path.key;
      choose.textContent = "Choose this path and continue";
      choose.addEventListener("click", (event) => {
        const current = {
          name: nameInput.value.trim().slice(0, 40),
          goal: goalInput.value.trim().slice(0, 500),
          support: supportInput.value,
          path: path.key,
        };
        if (!writeProfile(current)) {
          event.preventDefault();
          announce(
            status,
            "Guardian could not save this path in your browser. Check that browser storage is allowed, then try again.",
            "error",
          );
          bringIntoView(status);
          return;
        }
        announce(status, "Path saved. Opening Member Home…", "success");
      });

      article.append(tag, heading, reason, list, price, choose);
      return article;
    }

    function pathsFor(profile) {
      const name = profile.name || "there";
      const goal = profile.goal || "your lifestyle goal";
      const query = profile.goal.toLowerCase();
      const wantsProduct =
        /product|supplement|vitamin|toothpaste|toothbrush|red light|cold plunge|barcode|ingredient|label/.test(
          query,
        );
      const wantsFood = /meal|food|grocery|weight|lose|nutrition|eat|diet/.test(
        query,
      );

      if (profile.support === "self") {
        const paths = [
          {
            title: "Self-Guided",
            reason: `A lower-support place to start with ${goal}.`,
            features: [
              wantsFood ? "Food and meal-building tools" : "Core learning tools",
              "Evidence library",
              "30-day foundation",
            ],
            key: "explore",
          },
        ];
        if (wantsProduct) {
          paths.push({
            title: "Guardian Research",
            reason:
              "Useful if you want help comparing a product without adding human coaching.",
            features: [
              "Evidence-first product comparison",
              "Source trail",
              "No commission-based ranking",
            ],
            key: "guardian",
          });
        }
        return paths;
      }

      if (profile.support === "guardian") {
        return [
          {
            title: "Guardian Research",
            reason: `Research support for ${goal}.`,
            features: [
              wantsProduct ? "Product and vendor comparison" : "Member-directed research",
              "Evidence labels and source trails",
              "Options without pressure",
            ],
            key: "guardian",
          },
          {
            title: "Self-Guided",
            reason: "A lower-cost fallback if you prefer to do more on your own.",
            features: ["Core tools", "Evidence library", "30-day foundation"],
            key: "explore",
          },
        ];
      }

      if (profile.support === "structured") {
        return [
          {
            title: "Structured Support",
            reason: `A guided starting point for ${name}, focused on ${goal}.`,
            features: [
              wantsFood ? "Meal/lifestyle planning tools" : "Goal-based plan",
              "Guardian check-ins",
              "Progress tools",
            ],
            key: "structured",
          },
          {
            title: "Guardian Research",
            reason: "A lighter option if you do not want a full structured plan.",
            features: ["Research support", "Evidence trails", "Member-controlled pace"],
            key: "guardian",
          },
        ];
      }

      if (profile.support === "human") {
        return [
          {
            title: "Human Support",
            reason: "For members who explicitly want a qualified person involved.",
            features: [
              "Consent-based matching",
              "Location/service routing",
              "Scope and credential checks",
            ],
            key: "human",
          },
          {
            title: "Structured Support",
            reason: "A lower-touch option before adding a person.",
            features: ["Goal-based program", "Guardian check-ins", "Progress tools"],
            key: "structured",
          },
        ];
      }

      return [
        {
          title: "Concierge / High-Touch",
          reason:
            "A future high-support path for members requesting coordinated help.",
          features: [
            "Deep research",
            "Coordinated qualified support",
            "Transparent scope and cost before purchase",
          ],
          key: "concierge",
        },
        {
          title: "Human Support",
          reason: "A less intensive alternative.",
          features: ["Qualified support", "Consent-based contact", "Clear boundaries"],
          key: "human",
        },
      ];
    }

    function renderOptions(profile, moveToResults = true) {
      options.replaceChildren();
      pathsFor(profile).forEach((path) => options.appendChild(makePathCard(path)));
      if (moveToResults) {
        announce(status, "Your options are ready below. Choose one to continue.", "success");
        bringIntoView(options);
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = {
        name: nameInput.value.trim().slice(0, 40),
        goal: goalInput.value.trim().slice(0, 500),
        support: supportInput.value,
      };

      if (!profile.name) {
        announce(status, "Enter the name you would like Guardian to use.", "error");
        nameInput.focus();
        return;
      }
      if (!profile.goal) {
        announce(status, "Tell Guardian what you would like to work on.", "error");
        goalInput.focus();
        return;
      }
      if (!writeProfile(profile)) {
        announce(
          status,
          "Guardian could not save your information in this browser. Check that browser storage is allowed, then try again.",
          "error",
        );
        return;
      }
      renderOptions(profile);
    });

    if (saved.name && saved.goal) renderOptions(saved, false);
  }

  function initLab() {
    const form = $("guardianForm");
    if (!form) return;

    const question = $("guardianQuestion");
    const answer = $("guardianAnswer");
    const tone = $("guardianTone");
    const status = $("guardianStatus");
    const profile = readProfile();
    const pathContext = $("guardianPathContext");
    const greeting = $("guardianGreeting");
    const pathNames = {
      explore: "Self-Guided / Explore",
      guardian: "Guardian Research",
      structured: "Structured Support",
      human: "Human Support",
      concierge: "Concierge",
    };

    if (pathContext) {
      pathContext.textContent = profile.path
        ? `Current test path: ${pathNames[profile.path] || profile.path}. Goal: ${profile.goal || "not set"}.`
        : "No member path loaded. Start with Meet Guardian to select one.";
    }
    if (greeting && profile.name) {
      greeting.textContent = `Hey, ${profile.name}. What would you like to work on today?`;
    }

    function responseCard(label, text) {
      const card = document.createElement("div");
      card.className = "notice";
      card.style.marginTop = "10px";
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      card.append(strong, text);
      return card;
    }

    function respond(raw) {
      const value = raw.trim();
      if (!value) {
        announce(status, "Enter a question for Guardian first.", "error");
        question.focus();
        return;
      }

      const lower = value.toLowerCase();
      const fragments = [];
      const lead =
        tone.value === "gentle"
          ? "We can look at that carefully without jumping to a conclusion."
          : tone.value === "direct"
            ? "Here is the clean evidence-first way to look at it."
            : "Let’s separate what is known from what is uncertain.";

      if (
        /stop|quit|come off|discontinue/.test(lower) &&
        /(statin|medication|medicine|blood pressure|prescription)/.test(lower)
      ) {
        fragments.push([
          "Safety boundary",
          "Do not stop or change a prescribed medicine based on this prototype. Identify why it was prescribed, your current risks or measurements, possible side effects, alternatives, and what monitoring would be needed if a clinician changes the plan.",
        ]);
        fragments.push([
          "Your decision support",
          "Write down the exact concern, symptoms or side effects, medication and dose, and the questions you want answered. Ask about absolute benefit, risks, alternatives, and whether objective follow-up testing is appropriate.",
        ]);
      } else if (/parasite|pinworm|itch|anus|anal/.test(lower)) {
        fragments.push([
          "Established",
          "Some parasites can cause gastrointestinal or other symptoms. Pinworm can cause nighttime itching around the anus, but a symptom by itself does not prove the diagnosis.",
        ]);
        fragments.push([
          "Needs testing/context",
          "Exposure history, timing, household spread, travel, pets depending on the organism, and organism-specific testing matter. Different parasites require different approaches.",
        ]);
        fragments.push([
          "Not established",
          "A full-moon pattern or sugar craving alone should not be treated as diagnostic proof.",
        ]);
      } else if (/b12|cyanocobalamin|methylcobalamin|hydroxo|adenosyl/.test(lower)) {
        fragments.push([
          "Established",
          "Vitamin B12 is essential. Cyanocobalamin, methylcobalamin, hydroxocobalamin, and adenosylcobalamin are real forms used in supplements or medical products.",
        ]);
        fragments.push([
          "Uncertain/individual",
          "One form is not proven universally superior for everyone. Absorption, deficiency cause, dose, route, cost, and individual medical circumstances can matter more than marketing language.",
        ]);
        fragments.push([
          "Good comparison question",
          "Compare the exact form, dose, route, evidence for your situation, third-party quality information, and cost.",
        ]);
      } else if (/fast|one meal|omad|autophagy/.test(lower)) {
        fragments.push([
          "Established",
          "Meal timing and energy intake can affect weight and metabolic markers, and fasting activates cellular pathways studied under the term autophagy.",
        ]);
        fragments.push([
          "Important limit",
          "Human outcomes depend on duration, total nutrition, medications, age, pregnancy status, diabetes risk, eating-disorder history, and other factors. Autophagy is not a guarantee of whole-body rebuilding.",
        ]);
        fragments.push([
          "Before experimenting",
          "Clarify your goal, choose a conservative approach, maintain adequate nutrition and hydration, and get professional guidance when medical conditions or medications make fasting higher-risk.",
        ]);
      } else if (/barcode|upc|ean/.test(lower)) {
        fragments.push([
          "What a barcode is",
          "A UPC/EAN is an identifier or lookup key. It is not evidence and does not itself contain a complete ingredient or health profile.",
        ]);
        fragments.push([
          "Current development status",
          "Camera capture can be tested in supported browsers. A verified live product database is not connected, so a captured code must not be presented as verified product identity.",
        ]);
        fragments.push([
          "Future behavior",
          "After a verified database connection, Guardian should separate product identity, ingredient data, nutrition facts, source, verification status, and review date.",
        ]);
      } else if (/old book|histor|1800|1900|1912|suppressed|subdued/.test(lower)) {
        fragments.push([
          "Audit rule",
          "Old material is evidence of what people observed, believed, tested, or marketed at that time—not automatic proof that the explanation was correct.",
        ]);
        fragments.push([
          "Research path",
          "Find the original source, date, author, exact claim, contemporary criticism, later human evidence, contradictory evidence, safety history, and any documented commercial or institutional influence.",
        ]);
        fragments.push([
          "Publication rule",
          "Label the result as historically observed, later validated, partly validated, disproven or superseded, still uncertain, or unsafe.",
        ]);
      } else if (/label|ingredient|chemical|food|sugar|sodium/.test(lower)) {
        fragments.push([
          "Start with the package",
          "Use serving size, added sugar, sodium, fiber, protein, fats, and the ingredient list. Avoid declaring a food good or bad from one number or one unfamiliar chemical name.",
        ]);
        fragments.push([
          "Evidence-first",
          "Explain what each ingredient does, typical exposure, human evidence, regulatory status, and meaningful alternatives.",
        ]);
      } else {
        fragments.push([
          "Known vs unknown",
          "This local prototype does not have a live evidence database or web research connection. It can demonstrate the decision framework, but it should not invent a citation or pretend it checked a source.",
        ]);
        fragments.push([
          "Next question",
          "What exact claim, ingredient, symptom, product, habit, or historical source do you want to investigate? A precise question makes the evidence audit stronger.",
        ]);
      }

      answer.replaceChildren();
      const introduction = document.createElement("p");
      const introductionStrong = document.createElement("strong");
      introductionStrong.textContent = lead;
      introduction.appendChild(introductionStrong);
      answer.appendChild(introduction);
      fragments.forEach(([label, text]) => answer.appendChild(responseCard(label, text)));

      const boundary = document.createElement("p");
      boundary.className = "small";
      const boundaryStrong = document.createElement("strong");
      boundaryStrong.textContent = "Your choice: ";
      boundary.append(
        boundaryStrong,
        "This response is educational decision support, not a diagnosis or treatment plan. When evidence is mixed, Guardian should show that uncertainty and the supporting sources.",
      );
      answer.appendChild(boundary);

      announce(status, "Guardian’s response is ready below.", "success");
      bringIntoView(answer);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      respond(question.value);
    });
    document.querySelectorAll(".sample-q").forEach((button) => {
      button.addEventListener("click", () => {
        question.value = button.dataset.q || "";
        respond(question.value);
      });
    });
  }

  function initMemberHome() {
    if (!$("hello")) return;
    const profile = readProfile();
    const name = profile.name || "friend";
    const pathNames = {
      explore: "Explore",
      guardian: "Guardian",
      structured: "Structured Support",
      human: "Human Support",
      concierge: "Concierge",
    };

    $("hello").textContent = `Hey, ${name}. How are you doing today?`;
    $("goalLine").textContent = profile.goal
      ? `You’re working on: ${profile.goal}. What would help you move that forward today?`
      : "What would you like to work on today?";
    $("goalMetric").textContent = profile.goal || "Not set";
    $("pathName").textContent = pathNames[profile.path] || "Choose a path";
    $("continueText").textContent = profile.goal
      ? `Keep moving on “${profile.goal}” at your pace. Guardian can help you research, compare options, and choose your next step.`
      : "Tell Guardian what you want to accomplish and it will show relevant support paths.";

    let deferredInstall;
    const installButton = $("installBtn");
    const installMessage = $("installMsg");
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstall = event;
    });
    installButton?.addEventListener("click", async () => {
      if (deferredInstall) {
        deferredInstall.prompt();
        await deferredInstall.userChoice;
        deferredInstall = null;
        installMessage.textContent = "Your browser handled the install request.";
      } else {
        installMessage.textContent =
          "Use your browser menu and choose “Add to Home Screen” or “Install app” if available.";
      }
    });
  }

  initWelcome();
  initLab();
  initMemberHome();
})();
