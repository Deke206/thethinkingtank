(() => {
  "use strict";

  const root = document.querySelector("[data-work-history]");
  if (!root) return;

  const repository = root.dataset.repository || "Deke206/thethinkingtank";
  const branch = root.dataset.branch || "main";
  const timeline = root.querySelector("[data-work-history-timeline]");
  const status = root.querySelector("[data-work-history-status]");
  const totalValue = root.querySelector("[data-work-history-total]");
  const activeDaysValue = root.querySelector("[data-work-history-days]");
  const firstValue = root.querySelector("[data-work-history-first]");
  const latestValue = root.querySelector("[data-work-history-latest]");

  if (!timeline || !status || !totalValue || !activeDaysValue || !firstValue || !latestValue) return;

  const TIME_ZONE = "America/Los_Angeles";
  const CACHE_KEY = `shynetyme-work-history:${repository}:${branch}:v1`;
  const CACHE_TTL = 15 * 60 * 1000;
  const MAX_PAGES = 10;

  const previewMilestones = [
    { sha: "e16a0c7ec9ac3f0a228289f856fd3eed15935ed0", date: "2026-07-22T23:35:00Z", message: "Finish helper and update About Deke page" },
    { sha: "8ce7e4bb3038720a56b61d65a6cac037680134b7", date: "2026-07-23T00:25:00Z", message: "Add shared motion compatibility for DeX" },
    { sha: "515d9af8aab2986775bb873a7093c637cc247ecd", date: "2026-07-23T00:28:00Z", message: "Load shared motion and About links sitewide" },
    { sha: "724791a34864f4f40325aa8011300e97eb9368fe", date: "2026-07-23T00:31:00Z", message: "Use shared motion on About Deke Chuck" },
    { sha: "e80499f44fc5ab8b3883dec9388c26eefbd6d325", date: "2026-07-23T09:43:49Z", message: "Add comprehensive Home Builder page" },
    { sha: "cc7541ca19319e6c622485f1b3a84518cb602533", date: "2026-07-23T10:39:29Z", message: "Add LED banner magic demo styles" },
    { sha: "60d79590e14d482e00b08da43a1a5a8c8fa4ce4d", date: "2026-07-23T10:41:07Z", message: "Add canvas LED matrix animation demo" },
    { sha: "39ba81f86939c272282253ef42c4ea5bb419c925", date: "2026-07-23T10:41:57Z", message: "Publish LED banner magic example page" },
    { sha: "502376bc8347a4a589244fdf8f363ba308f764de", date: "2026-07-23T19:34:50Z", message: "Add shared randomized LED matrix ribbons" },
    { sha: "a577f49d0c42b809ed6e0b43be15c1dd5ea80421", date: "2026-07-23T19:35:31Z", message: "Use shared top bottom and breadcrumb LED matrix frames" },
    { sha: "1eb4340528a77f002f6be6b7e7465bd4008914c0", date: "2026-07-23T19:36:07Z", message: "Load shared matrix ribbons with sitewide Chuck" },
    { sha: "dc4190ac396d63e36f8207942fa344051cb49e22", date: "2026-07-23T19:37:18Z", message: "Point shared site loader to randomized matrix ribbons" },
    { sha: "794638d782336c8d1f046c0304f571094d511129", date: "2026-07-23T19:39:21Z", message: "Keep long LED messages moving across full ribbons" },
    { sha: "bdbf8972dbce878cada6c1ca4eb37b8035860ff0", date: "2026-07-23T20:22:42Z", message: "Separate shared LED matrix styles from hero and Chuck" },
    { sha: "3a80ed9cf4d46994c766079a3aa1b4cc8471eec3", date: "2026-07-23T20:23:05Z", message: "Keep shared hero layout separate from LED matrix presentation" },
    { sha: "8963c5d36deacb819252de35259fe927b75a1a1e", date: "2026-07-23T20:24:43Z", message: "Optimize shared LED matrix and pause off-screen rendering" },
    { sha: "520855a958ccf3ed82994b4360ea0fb036ddcf77", date: "2026-07-23T20:25:34Z", message: "Separate Chuck from LED matrix and show thoughts only at page bottom" },
    { sha: "bad30c13e8a6272a2f11107714fcbc23e355a6b4", date: "2026-07-23T20:26:13Z", message: "Load LED matrix independently and remove navigation flare effects" },
    { sha: "842dec435cfa6fc9b2d17bf202a656ecbf8aa2a1", date: "2026-07-23T20:27:23Z", message: "Use clean shared site loader on About Deke page" },
    { sha: "d93bb598752db5d934c03aa0cbb41e50a1a197a0", date: "2026-07-23T21:05:58Z", message: "Add shared Build dropdown and restore navigation flare styling" },
    { sha: "2426e4b03d62216e97405c6b4f655f385e10893d", date: "2026-07-23T21:06:45Z", message: "Group builders under Build dropdown and restore navigation effects" },
    { sha: "e95d57cc6396be109bb3e49fc5e2d7a358e91e1d", date: "2026-07-23T21:08:01Z", message: "Fix Build dropdown placement and prevent duplicate About link" }
  ];

  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit"
  });

  const setStatus = (message, state = "ready") => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const firstLine = (message) => String(message || "Website update")
    .split(/\r?\n/, 1)[0]
    .replace(/\s+/g, " ")
    .trim();

  const normalizeCommit = (item) => ({
    sha: String(item.sha || "").trim(),
    date: item.date || item.commit?.author?.date || item.commit?.committer?.date || "",
    message: firstLine(item.message || item.commit?.message)
  });

  const localDayKey = (dateValue) => {
    const date = new Date(dateValue);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };

  const classify = (message) => {
    const value = message.toLowerCase();
    if (/chuck|sprite|helper|thought/.test(value)) return { key: "chuck", label: "Chuck" };
    if (/home builder|bike builder|builder|configurator|build my/.test(value)) return { key: "builder", label: "Builder" };
    if (/led|matrix|banner|wled|lighting|light strip/.test(value)) return { key: "led", label: "LED" };
    if (/fix|repair|restore|hotfix|bug|broken|missing|correct/.test(value)) return { key: "fix", label: "Fix" };
    if (/about|copy|content|wording|text|privacy|terms/.test(value)) return { key: "content", label: "Content" };
    if (/css|style|design|header|hero|carousel|navigation|navbar|layout|image/.test(value)) return { key: "design", label: "Design" };
    if (/catalog|product|scraper/.test(value)) return { key: "catalog", label: "Catalog" };
    if (/workflow|history|docs|document/.test(value)) return { key: "process", label: "Process" };
    return { key: "website", label: "Website" };
  };

  const readCache = () => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (!cached || Date.now() - cached.savedAt > CACHE_TTL || !Array.isArray(cached.commits)) return null;
      return cached.commits;
    } catch {
      return null;
    }
  };

  const writeCache = (commits) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), commits }));
    } catch {
      // The page remains functional when browser storage is unavailable.
    }
  };

  const parseNextLink = (header) => {
    if (!header) return "";
    const part = header.split(",").find((entry) => /rel="next"/.test(entry));
    return part?.match(/<([^>]+)>/)?.[1] || "";
  };

  const fetchStaticHistory = async () => {
    const url = new URL("../data/work-history.json", window.location.href);
    url.searchParams.set("v", "20260724-preview");
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Static history is not generated yet.");
    const data = await response.json();
    if (!Array.isArray(data.commits) || !data.commits.length) throw new Error("Static history is empty.");
    return data.commits.map(normalizeCommit).filter((item) => item.sha && item.date);
  };

  const fetchLiveHistory = async () => {
    let nextUrl = `https://api.github.com/repos/${encodeURIComponent(repository.split("/")[0])}/${encodeURIComponent(repository.split("/")[1])}/commits?sha=${encodeURIComponent(branch)}&per_page=100`;
    const commits = [];
    let page = 0;

    while (nextUrl && page < MAX_PAGES) {
      page += 1;
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch(nextUrl, {
          headers: { Accept: "application/vnd.github+json" },
          signal: controller.signal
        });

        if (!response.ok) {
          const remaining = response.headers.get("x-ratelimit-remaining");
          if (response.status === 403 && remaining === "0") throw new Error("GitHub's public viewing limit is temporarily reached.");
          throw new Error(`GitHub history request failed (${response.status}).`);
        }

        const pageItems = await response.json();
        commits.push(...pageItems.map(normalizeCommit));
        nextUrl = parseNextLink(response.headers.get("link"));
      } finally {
        window.clearTimeout(timer);
      }
    }

    const unique = new Map();
    commits.forEach((commit) => {
      if (commit.sha && commit.date && !unique.has(commit.sha)) unique.set(commit.sha, commit);
    });

    return [...unique.values()].sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const buildEntry = (commit) => {
    const item = document.createElement("li");
    item.className = "work-history__entry";

    const copy = document.createElement("div");
    copy.className = "work-history__entry-copy";

    const message = document.createElement("span");
    message.className = "work-history__message";
    message.textContent = commit.message;

    const meta = document.createElement("div");
    meta.className = "work-history__meta";

    const time = document.createElement("time");
    time.dateTime = commit.date;
    time.textContent = timeFormatter.format(new Date(commit.date));

    const hash = document.createElement("code");
    hash.className = "work-history__hash";
    hash.textContent = commit.sha.slice(0, 8);
    hash.title = "Read-only commit identifier";

    meta.append(time, hash);
    copy.append(message, meta);

    const category = classify(commit.message);
    const tag = document.createElement("span");
    tag.className = "work-history__tag";
    tag.dataset.kind = category.key;
    tag.textContent = category.label;

    item.append(copy, tag);
    return item;
  };

  const render = (rawCommits, sourceLabel) => {
    const commits = rawCommits
      .map(normalizeCommit)
      .filter((item) => item.sha && item.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    timeline.replaceChildren();

    if (!commits.length) {
      const empty = document.createElement("li");
      empty.className = "work-history__empty";
      empty.textContent = "The work-history record is not available right now.";
      timeline.appendChild(empty);
      totalValue.textContent = "—";
      activeDaysValue.textContent = "—";
      firstValue.textContent = "—";
      latestValue.textContent = "—";
      return;
    }

    const groups = new Map();
    commits.forEach((commit) => {
      const key = localDayKey(commit.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(commit);
    });

    const fragment = document.createDocumentFragment();
    groups.forEach((dayCommits) => {
      const dayItem = document.createElement("li");
      dayItem.className = "work-history__day";

      const heading = document.createElement("h3");
      heading.className = "work-history__day-heading";

      const dateText = document.createElement("span");
      dateText.textContent = dayFormatter.format(new Date(dayCommits[0].date));

      const count = document.createElement("span");
      count.className = "work-history__day-count";
      count.textContent = `${dayCommits.length} ${dayCommits.length === 1 ? "edit" : "edits"}`;

      heading.append(dateText, count);

      const entries = document.createElement("ol");
      entries.className = "work-history__entries";
      dayCommits.forEach((commit) => entries.appendChild(buildEntry(commit)));

      dayItem.append(heading, entries);
      fragment.appendChild(dayItem);
    });

    timeline.appendChild(fragment);
    totalValue.textContent = commits.length.toLocaleString("en-US");
    activeDaysValue.textContent = groups.size.toLocaleString("en-US");
    firstValue.textContent = shortDateFormatter.format(new Date(commits[0].date));
    latestValue.textContent = shortDateFormatter.format(new Date(commits[commits.length - 1].date));
    setStatus(`${sourceLabel} · displayed oldest to newest · ${commits.length.toLocaleString("en-US")} read-only edits`);
  };

  const load = async () => {
    const cached = readCache();
    if (cached?.length) {
      render(cached, "Cached public history");
      return;
    }

    setStatus("Loading the public website history from its first available commit…");

    try {
      const staticCommits = await fetchStaticHistory();
      writeCache(staticCommits);
      render(staticCommits, "Generated public history");
      return;
    } catch {
      // The branch preview intentionally falls through to the public read-only API.
    }

    try {
      const liveCommits = await fetchLiveHistory();
      if (!liveCommits.length) throw new Error("No commits were returned.");
      writeCache(liveCommits);
      render(liveCommits, "Live public history");
    } catch (error) {
      render(previewMilestones, "Preview milestone fallback");
      setStatus(`${error.message || "Live history is temporarily unavailable."} Showing verified preview milestones instead.`, "error");
    }
  };

  load();
})();
