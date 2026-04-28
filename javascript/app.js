const STORAGE_KEYS = {
  pantry: "smart_grocery_pantry",
  need: "smart_grocery_need"
};
 
// Frontend-only with Vite env variable
const GEMINI_KEY = (import.meta.env?.VITE_GEMINI_API_KEY || "").trim();
 
document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
 
  const page = document.body.dataset.page;
  if (page === "home") initHomePage();
  if (page === "pantry") initPantryPage();
  if (page === "meals") initMealsPage();
});
 
function setActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll("nav a[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) link.classList.add("active");
  });
}
 
function loadList(type) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[type]);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
 
function saveList(type, items) {
  localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(items));
}
 
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };
    return map[char] || char;
  });
}
 
/* ---------------- Home ---------------- */
 
function initHomePage() {
  const now = new Date();
  const hour = now.getHours();
 
  const greeting =
    hour < 12
      ? "Good morning. Let's plan meals."
      : hour < 18
      ? "Good afternoon. What's for dinner?"
      : "Good evening. Ready to build tomorrow's list?";
 
  const greetingEl = document.getElementById("greeting");
  if (greetingEl) greetingEl.textContent = greeting;
 
  const dateEl = document.getElementById("todayDate");
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }
 
  updateHomeCounts();
}
 
function updateHomeCounts() {
  const pantry = loadList("pantry");
  const need = loadList("need");
 
  const pantryEl = document.getElementById("homePantryCount");
  const needEl = document.getElementById("homeNeedCount");
 
  if (pantryEl) pantryEl.textContent = String(pantry.length);
  if (needEl) needEl.textContent = String(need.length);
}
 
/* ---------------- Pantry ---------------- */
 
function initPantryPage() {
  const pantryInput = document.getElementById("pantryInput");
  const needInput = document.getElementById("needInput");
  const addPantryBtn = document.getElementById("addPantryBtn");
  const addNeedBtn = document.getElementById("addNeedBtn");
  const clearPantryBtn = document.getElementById("clearPantryBtn");
  const clearNeedBtn = document.getElementById("clearNeedBtn");
 
  if (addPantryBtn && pantryInput) {
    addPantryBtn.addEventListener("click", () => {
      addItem("pantry", pantryInput.value);
      pantryInput.value = "";
      pantryInput.focus();
    });
 
    pantryInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        addItem("pantry", pantryInput.value);
        pantryInput.value = "";
      }
    });
  }
 
  if (addNeedBtn && needInput) {
    addNeedBtn.addEventListener("click", () => {
      addItem("need", needInput.value);
      needInput.value = "";
      needInput.focus();
    });
 
    needInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        addItem("need", needInput.value);
        needInput.value = "";
      }
    });
  }
 
  if (clearPantryBtn) {
    clearPantryBtn.addEventListener("click", () => {
      if (confirm("Clear pantry list?")) {
        saveList("pantry", []);
        renderPantryPage();
      }
    });
  }
 
  if (clearNeedBtn) {
    clearNeedBtn.addEventListener("click", () => {
      if (confirm("Clear need-to-buy list?")) {
        saveList("need", []);
        renderPantryPage();
      }
    });
  }
 
  renderPantryPage();
}
 
function addItem(type, raw) {
  const value = raw.trim();
  if (!value) return;
 
  const list = loadList(type);
  list.push(value);
  saveList(type, list);
 
  if (document.body.dataset.page === "pantry") renderPantryPage();
}
 
function removeItem(type, index) {
  const list = loadList(type);
  list.splice(index, 1);
  saveList(type, list);
  renderPantryPage();
}
 
function moveNeedToPantry(index) {
  const need = loadList("need");
  const pantry = loadList("pantry");
  const [item] = need.splice(index, 1);
 
  if (item) pantry.push(item);
 
  saveList("need", need);
  saveList("pantry", pantry);
  renderPantryPage();
}
 
function renderPantryPage() {
  const pantry = loadList("pantry");
  const need = loadList("need");
 
  renderList("pantryList", pantry, "pantry");
  renderList("needList", need, "need");
 
  const pantryCount = document.getElementById("pantryCount");
  const needCount = document.getElementById("needCount");
 
  if (pantryCount) pantryCount.textContent = String(pantry.length);
  if (needCount) needCount.textContent = String(need.length);
}
 
function renderList(targetId, items, type) {
  const listEl = document.getElementById(targetId);
  if (!listEl) return;
 
  listEl.innerHTML = "";
 
  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = "<span class='muted'>No items yet.</span>";
    listEl.appendChild(li);
    return;
  }
 
  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "item";
 
    const text = document.createElement("span");
    text.textContent = item;
 
    const actions = document.createElement("div");
    actions.className = "item-actions";
 
    if (type === "need") {
      const boughtBtn = document.createElement("button");
      boughtBtn.className = "btn btn-secondary";
      boughtBtn.textContent = "Bought";
      boughtBtn.addEventListener("click", () => moveNeedToPantry(index));
      actions.appendChild(boughtBtn);
    }
 
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeItem(type, index));
    actions.appendChild(removeBtn);
 
    li.appendChild(text);
    li.appendChild(actions);
    listEl.appendChild(li);
  });
}
 
/* ---------------- Meal Ideas ---------------- */
 
function initMealsPage() {
  const keyStatus = document.getElementById("keyStatus");
  if (keyStatus) {
    keyStatus.textContent = GEMINI_KEY
      ? "API key loaded from .env. If quota fails, fallback mode will still generate ideas."
      : "No API key detected. Running in built-in creative fallback mode.";
  }
 
  const refreshBtn = document.getElementById("refreshIngredientsBtn");
  const askBtn = document.getElementById("askIdeaBtn");
 
  if (refreshBtn) refreshBtn.addEventListener("click", renderIngredientChecklist);
  if (askBtn) askBtn.addEventListener("click", askForMealIdea);
 
  renderIngredientChecklist();
}
 
function renderIngredientChecklist() {
  const wrap = document.getElementById("ingredientChecklist");
  if (!wrap) return;
 
  const pantryItems = [...new Set(loadList("pantry"))];
  wrap.innerHTML = "";
 
  if (pantryItems.length === 0) {
    wrap.innerHTML = "<p class='muted'>No pantry items yet. Add some in My Lists first.</p>";
    return;
  }
 
  pantryItems.forEach((item, index) => {
    const label = document.createElement("label");
    label.className = "check-chip";
 
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = `ing-${index}`;
    cb.value = item;
 
    const text = document.createElement("span");
    text.textContent = item;
 
    label.appendChild(cb);
    label.appendChild(text);
    wrap.appendChild(label);
  });
}
 
async function askForMealIdea() {
  const resultEl = document.getElementById("ideaResult");
  const mealTypeEl = document.getElementById("mealType");
  const customEl = document.getElementById("customIngredients");
 
  if (!resultEl || !mealTypeEl || !customEl) return;
 
  const selected = Array.from(
    document.querySelectorAll("#ingredientChecklist input[type='checkbox']:checked")
  ).map((el) => el.value);
 
  const custom = customEl.value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
 
  const ingredients = [...new Set([...selected, ...custom])];
  const mealType = mealTypeEl.value;
 
  if (ingredients.length === 0) {
    resultEl.innerHTML = "<p class='muted'>Select at least one ingredient first.</p>";
    return;
  }
 
  resultEl.innerHTML = "<p class='muted'>Generating a meal idea...</p>";
 
  // If no key, use fallback immediately
  if (!GEMINI_KEY) {
    const fallback = generateFallbackIdea(mealType, ingredients, "No API key found.");
    renderIdea(fallback, ingredients, "Fallback");
    return;
  }
 
  // Try Gemini first, fallback on any error (quota, model, network, etc.)
  try {
    const idea = await requestGeminiIdea(GEMINI_KEY, mealType, ingredients);
    renderIdea(idea, ingredients, "AI");
  } catch (err) {
    const fallback = generateFallbackIdea(mealType, ingredients, err.message);
    renderIdea(fallback, ingredients, "Fallback");
  }
}
 
async function requestGeminiIdea(apiKey, mealType, ingredients) {
  const prompt = `
You are a creative cooking assistant.
Meal type: ${mealType}
Ingredients: ${ingredients.join(", ")}
 
Return ONLY JSON in this exact schema:
{
  "title": "short creative recipe title",
  "reason": "1-2 sentence explanation",
  "steps": ["step 1", "step 2", "step 3", "step 4"]
}
`;
 
  const url =
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
 
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 450
      }
    })
  });
 
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini error (${response.status}): ${errText}`);
  }
 
  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("\n")
    .trim();
 
  if (!raw) throw new Error("Empty AI response.");
 
  const parsed = parseJsonFromText(raw);
 
  if (parsed?.title) {
    return {
      title: String(parsed.title).trim(),
      reason: String(parsed.reason || "").trim(),
      steps: Array.isArray(parsed.steps)
        ? parsed.steps.map((s) => String(s).trim()).filter(Boolean).slice(0, 6)
        : ["Prep ingredients.", "Cook.", "Season.", "Serve."],
      meta: "Generated by Gemini."
    };
  }
 
  return {
    title: "Meal Idea",
    reason: raw,
    steps: ["Prep ingredients.", "Cook.", "Season.", "Serve."],
    meta: "Generated by Gemini (unstructured response)."
  };
}
 
function parseJsonFromText(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
 
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}
 
function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
 
function generateFallbackIdea(mealType, ingredients, errorMessage = "") {
  const main = ingredients.slice(0, 3).join(", ");
  const all = ingredients.join(", ");
 
  const titlesByMeal = {
    breakfast: [
      `Sunrise Skillet with ${main}`,
      `Morning Power Bowl`,
      `Quick Start Breakfast Mix`
    ],
    lunch: [
      `Midday Mix Plate`,
      `Fresh Lunch Toss`,
      `No-Stress Lunch Bowl`
    ],
    snack: [
      `Crunch and Munch Combo`,
      `Mini Energy Bites Plate`,
      `After-Class Snack Box`
    ],
    dinner: [
      `Cozy Pantry Supper`,
      `Weeknight One-Pan Idea`,
      `Comfort Plate with ${main}`
    ]
  };
 
  const stepsByMeal = {
    breakfast: [
      "Chop or prep the ingredients you selected.",
      "Saute or warm the hearty items first.",
      "Add quick-cooking ingredients and season lightly.",
      "Serve hot with toast, fruit, or yogurt if available."
    ],
    lunch: [
      "Prep ingredients into bite-size pieces.",
      "Combine a base (greens, grains, or wraps) with your items.",
      "Add a quick dressing or seasoning blend.",
      "Serve as a bowl, wrap, or plate."
    ],
    snack: [
      "Choose 2-3 ingredients for texture and flavor contrast.",
      "Assemble into a small plate or cup portions.",
      "Add simple seasoning or dip if available.",
      "Serve immediately for a quick snack."
    ],
    dinner: [
      "Prep and season all ingredients first.",
      "Cook proteins or dense vegetables in a pan first.",
      "Add remaining ingredients and cook until balanced.",
      "Finish with herbs, citrus, or a sauce and serve warm."
    ]
  };
 
  let reason = `Built from your selected ingredients: ${all}.`;
  if (errorMessage) {
    reason += " AI was unavailable, so this creative fallback keeps your project demo working.";
  }
 
  return {
    title: choose(titlesByMeal[mealType] || titlesByMeal.dinner),
    reason,
    steps: stepsByMeal[mealType] || stepsByMeal.dinner,
    meta: errorMessage
      ? `Fallback mode activated: ${errorMessage}`
      : "Fallback mode activated."
  };
}
 
function renderIdea(idea, ingredients, sourceLabel = "AI") {
  const resultEl = document.getElementById("ideaResult");
  if (!resultEl) return;
 
  const steps = Array.isArray(idea.steps) ? idea.steps : [];
  const metaLine = idea.meta ? `<p class="muted"><em>${escapeHTML(idea.meta)}</em></p>` : "";
 
  resultEl.innerHTML = `
    <p class="muted"><strong>Source:</strong> ${escapeHTML(sourceLabel)}</p>
    <h3>${escapeHTML(idea.title || "Meal Idea")}</h3>
    <p><strong>Why this works:</strong> ${escapeHTML(idea.reason || "")}</p>
    <p><strong>Ingredients used:</strong> ${escapeHTML(ingredients.join(", "))}</p>
    <ol>${steps.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ol>
    ${metaLine}
  `;
}