async function loadSmartBets() {
  const status = document.getElementById("status");
  const list = document.getElementById("bets");

  try {
    const res = await fetch("./data/smart-bets.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load smart bets JSON");
    const data = await res.json();

    status.textContent = `Loaded ${data.bets?.length || 0} smart bets (updated: ${data.generated_at || "n/a"})`;
    list.innerHTML = (data.bets || []).map(b => `
      <div class="card">
        <h3>${b.league} — ${b.fixture}</h3>
        <div><span class="badge">${b.market}</span> <strong>${b.selection}</strong> @ ${b.odds ?? "—"}</div>
        <div>EV: <strong>${(b.expected_value * 100).toFixed(1)}%</strong> | Confidence: ${Math.round(b.confidence * 100)}%</div>
        <details style="margin-top:.5rem;">
          <summary>AI reasoning</summary>
          <p>${b.reasoning || "—"}</p>
        </details>
      </div>
    `).join("");
  } catch (e) {
    console.error(e);
    status.textContent = "Error loading smart bets.";
  }
}
loadSmartBets();
