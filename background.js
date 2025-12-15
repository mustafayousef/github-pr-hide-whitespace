const PR_DIFF_RE = /^\/[^/]+\/[^/]+\/pull\/\d+\/(files|changes)(?:\/.*)?$/;

function buildEnforcedUrl(raw) {
  try {
    const url = new URL(raw);
    if (!PR_DIFF_RE.test(url.pathname)) return null;

    let changed = false;
    const params = url.searchParams;

    if (params.get("diff") !== "split") { params.set("diff", "split"); changed = true; }
    if (params.get("w") !== "1") { params.set("w", "1"); changed = true; }

    if (!changed) return null;
    url.search = params.toString();
    return url.toString();
  } catch {
    return null;
  }
}

function maybeUpdate(details) {
  if (details.frameId !== 0) return;
  const enforced = buildEnforcedUrl(details.url);
  if (enforced && enforced !== details.url) {
    chrome.tabs.update(details.tabId, { url: enforced });
  }
}

chrome.webNavigation.onCommitted.addListener(maybeUpdate, {
  url: [{ hostEquals: "github.com" }]
});
chrome.webNavigation.onHistoryStateUpdated.addListener(maybeUpdate, {
  url: [{ hostEquals: "github.com" }]
});
