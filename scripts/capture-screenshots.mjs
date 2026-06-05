#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const rootDir = process.cwd();
const host = "127.0.0.1";
const defaultPort = process.env.SCREENSHOT_PORT || "3100";
const baseURL =
  process.env.SCREENSHOT_BASE_URL || `http://${host}:${defaultPort}`;
const storybookPort = process.env.STORYBOOK_PORT || "6006";
const storybookURL =
  process.env.STORYBOOK_BASE_URL || `http://${host}:${storybookPort}`;
const artifactRoot = path.resolve(
  rootDir,
  process.env.SCREENSHOT_ARTIFACT_DIR || path.join("artifacts", "screenshots"),
);
const manifestPath = path.join(artifactRoot, "manifest.json");

const pageDirs = {
  desktop: path.join(artifactRoot, "pages", "desktop"),
  mobile: path.join(artifactRoot, "pages", "mobile"),
};

const componentDirs = {
  desktop: path.join(artifactRoot, "components", "desktop"),
  mobile: path.join(artifactRoot, "components", "mobile"),
};

const profiles = [
  {
    key: "desktop",
    label: "Desktop Chrome",
    deviceName: "Desktop Chrome",
    outputDir: pageDirs.desktop,
    componentDir: componentDirs.desktop,
    context: {
      ...devices["Desktop Chrome"],
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    },
  },
  {
    key: "mobile",
    label: "Mobile Safari - iPhone 13",
    deviceName: "iPhone 13",
    outputDir: pageDirs.mobile,
    componentDir: componentDirs.mobile,
    context: {
      ...devices["iPhone 13"],
      reducedMotion: "reduce",
    },
  },
];

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function relativeArtifact(value) {
  return toPosixPath(path.relative(rootDir, value));
}

function commandName(name) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function readTextIfExists(target) {
  try {
    return await fs.readFile(target, "utf8");
  } catch {
    return "";
  }
}

async function readJson(target) {
  return JSON.parse(await fs.readFile(target, "utf8"));
}

async function walkFiles(dir) {
  if (!(await pathExists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  const ignoredDirectories = new Set([
    ".git",
    ".next",
    ".vercel",
    "artifacts",
    "blob-report",
    "coverage",
    "node_modules",
    "output",
    "playwright-report",
    "test-results",
  ]);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) continue;
      files.push(...(await walkFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function ensureOutputDirs() {
  await Promise.all(
    [
      artifactRoot,
      pageDirs.desktop,
      pageDirs.mobile,
      componentDirs.desktop,
      componentDirs.mobile,
    ].map((dir) => fs.mkdir(dir, { recursive: true })),
  );
}

function detectPackageManager(pkg) {
  if (pkg.packageManager?.startsWith("pnpm")) return "pnpm";
  if (pkg.packageManager?.startsWith("yarn")) return "yarn";
  if (pkg.packageManager?.startsWith("npm")) return "npm";
  return "pnpm";
}

function serverCommand(packageManager, script, port) {
  const nextCli = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
  const nextScript = script === "start" ? "start" : "dev";

  if (script === "dev" || script === "start") {
    return {
      command: process.execPath,
      args: [nextCli, nextScript, "--hostname", host, "--port", port],
      display: `node ${toPosixPath(path.relative(rootDir, nextCli))} ${nextScript} --hostname ${host} --port ${port}`,
    };
  }

  if (packageManager === "npm") {
    return {
      command: commandName("npm"),
      args: ["run", script, "--", "--hostname", host, "--port", port],
      display: `npm run ${script} -- --hostname ${host} --port ${port}`,
    };
  }

  return {
    command: commandName(packageManager),
    args: [script, "--hostname", host, "--port", port],
    display: `${packageManager} ${script} --hostname ${host} --port ${port}`,
  };
}

function storybookCommand(packageManager, script, port) {
  if (process.platform === "win32") {
    const commandText =
      packageManager === "npm"
        ? `npm run ${script} -- --host ${host} --port ${port}`
        : `${packageManager} ${script} --host ${host} --port ${port}`;

    return {
      command: "powershell.exe",
      args: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", commandText],
      display: commandText,
    };
  }

  if (packageManager === "npm") {
    return {
      command: commandName("npm"),
      args: ["run", script, "--", "--host", host, "--port", port],
      display: `npm run ${script} -- --host ${host} --port ${port}`,
    };
  }

  return {
    command: commandName(packageManager),
    args: [script, "--host", host, "--port", port],
    display: `${packageManager} ${script} --host ${host} --port ${port}`,
  };
}

async function fetchWithTimeout(url, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function waitForHttp(url, timeoutMs, logs) {
  const started = Date.now();
  let lastError = "";

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetchWithTimeout(url, 30_000);
      if (response.status < 500) return response;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const logTail = logs.slice(-20).join("\n");
  throw new Error(
    `Timed out waiting for ${url}. Last error: ${lastError}${
      logTail ? `\nServer log tail:\n${logTail}` : ""
    }`,
  );
}

function captureProcessLogs(child) {
  const logs = [];
  const push = (chunk) => {
    const text = chunk.toString();
    for (const line of text.split(/\r?\n/)) {
      if (line.trim()) logs.push(line);
    }
    if (logs.length > 200) logs.splice(0, logs.length - 200);
  };

  child.stdout?.on("data", push);
  child.stderr?.on("data", push);
  return logs;
}

async function startAppServer(project) {
  if (process.env.SCREENSHOT_BASE_URL) {
    await waitForHttp(baseURL, 30_000, []);
    return {
      started: false,
      baseURL,
      command: "external SCREENSHOT_BASE_URL",
      logs: [],
      stop: async () => {},
    };
  }

  try {
    await fetchWithTimeout(baseURL, 2500);
    return {
      started: false,
      baseURL,
      command: "reused existing server",
      logs: [],
      stop: async () => {},
    };
  } catch {
    // Start the configured local Next.js dev server below.
  }

  const command = serverCommand(
    project.packageManager,
    project.scripts.dev ? "dev" : "start",
    defaultPort,
  );
  const child = spawn(command.command, command.args, {
    cwd: rootDir,
    env: { ...process.env, PORT: defaultPort },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const logs = captureProcessLogs(child);

  child.on("exit", (code) => {
    if (code && code !== 0) logs.push(`Process exited with code ${code}`);
  });

  try {
    await waitForHttp(baseURL, 300_000, logs);
  } catch (error) {
    if (!child.killed) child.kill();
    throw error;
  }

  return {
    started: true,
    baseURL,
    command: command.display,
    logs,
    stop: async () => {
      if (!child.killed) child.kill();
    },
  };
}

async function startStorybook(project, storybook) {
  if (!storybook.detected) {
    return {
      started: false,
      baseURL: storybookURL,
      command: null,
      logs: [],
      stop: async () => {},
    };
  }

  if (process.env.STORYBOOK_BASE_URL) {
    await waitForHttp(storybookURL, 30_000, []);
    return {
      started: false,
      baseURL: storybookURL,
      command: "external STORYBOOK_BASE_URL",
      logs: [],
      stop: async () => {},
    };
  }

  try {
    await fetchWithTimeout(storybookURL, 2500);
    return {
      started: false,
      baseURL: storybookURL,
      command: "reused existing Storybook server",
      logs: [],
      stop: async () => {},
    };
  } catch {
    // Start Storybook when a script is configured.
  }

  if (!storybook.script) {
    throw new Error("Storybook files/dependencies were found, but no Storybook script exists in package.json.");
  }

  const command = storybookCommand(project.packageManager, storybook.script, storybookPort);
  const child = spawn(command.command, command.args, {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const logs = captureProcessLogs(child);

  try {
    await waitForHttp(storybookURL, 300_000, logs);
  } catch (error) {
    if (!child.killed) child.kill();
    throw error;
  }

  return {
    started: true,
    baseURL: storybookURL,
    command: command.display,
    logs,
    stop: async () => {
      if (!child.killed) child.kill();
    },
  };
}

function parseLocales(source) {
  const match = source.match(/locales:\s*\[([^\]]+)\]/m);
  if (!match) return ["vi", "en"];
  const values = [...match[1].matchAll(/["']([^"']+)["']/g)].map((item) => item[1]);
  return values.length > 0 ? values : ["vi", "en"];
}

function sectionBetween(source, startPattern, endPattern) {
  const start = source.search(startPattern);
  if (start < 0) return "";
  const rest = source.slice(start);
  const end = rest.search(endPattern);
  return end < 0 ? rest : rest.slice(0, end);
}

function parseSlugs(source, startPattern, endPattern) {
  const section = sectionBetween(source, startPattern, endPattern);
  return [...section.matchAll(/slug:\s*["']([^"']+)["']/g)].map((match) => match[1]);
}

function parseAdminSections(source) {
  const section = sectionBetween(source, /export const adminSections\s*=\s*\[/, /\]\s*as const/);
  return [...section.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
}

function parseAdminCreateLinks(source) {
  return [
    ...new Set(
      [...source.matchAll(/actionHref=["']([^"']+\?new=1)["']/g)].map((match) => match[1]),
    ),
  ];
}

function isPageFile(file) {
  return /[\\/]page\.(tsx|ts|jsx|js)$/.test(file);
}

function appendSegment(route, segment) {
  if (route === "/") return `/${segment}`;
  return `${route}/${segment}`;
}

async function discoverAppRoutes(context) {
  const routes = new Map();
  const unresolved = [];
  const appRoots = [path.join(rootDir, "app"), path.join(rootDir, "src", "app")];

  for (const appRoot of appRoots) {
    if (!(await pathExists(appRoot))) continue;
    const pageFiles = (await walkFiles(appRoot)).filter(isPageFile);

    for (const file of pageFiles) {
      const relative = path.relative(appRoot, file);
      const parts = relative.split(path.sep);
      const directories = parts.slice(0, -1);
      if (directories[0] === "api") continue;

      let variants = [
        {
          route: "/",
          params: {},
        },
      ];
      let unsupported = null;

      for (const segment of directories) {
        if (/^\(.+\)$/.test(segment) || segment.startsWith("@")) continue;

        if (segment === "[locale]") {
          variants = variants.flatMap((variant) =>
            context.locales.map((locale) => ({
              route: appendSegment(variant.route, locale),
              params: { ...variant.params, locale },
            })),
          );
          continue;
        }

        if (segment === "[section]") {
          variants = variants.flatMap((variant) =>
            context.adminSections.map((section) => ({
              route: appendSegment(variant.route, section),
              params: { ...variant.params, section },
            })),
          );
          continue;
        }

        if (segment === "[slug]") {
          const slugValues = directories.includes("products")
            ? context.productSlugs
            : directories.includes("blog")
              ? context.blogSlugs
              : [];

          if (slugValues.length === 0) {
            unsupported = `No sample values found for dynamic segment ${segment}`;
            break;
          }

          variants = variants.flatMap((variant) =>
            slugValues.map((slug) => ({
              route: appendSegment(variant.route, slug),
              params: { ...variant.params, slug },
            })),
          );
          continue;
        }

        if (/^\[.+\]$/.test(segment)) {
          unsupported = `Unsupported dynamic segment ${segment}`;
          break;
        }

        variants = variants.map((variant) => ({
          ...variant,
          route: appendSegment(variant.route, segment),
        }));
      }

      const source = toPosixPath(path.relative(rootDir, file));

      if (unsupported) {
        unresolved.push({ source, reason: unsupported });
        continue;
      }

      for (const variant of variants) {
        routes.set(variant.route, {
          route: variant.route,
          source,
          params: variant.params,
          type: "app-route",
        });
      }
    }
  }

  for (const href of context.adminCreateLinks) {
    routes.set(href, {
      route: href,
      source: "components/showroom/admin-pages.tsx actionHref",
      params: { new: "1" },
      type: "linked-admin-create-route",
    });
  }

  return {
    routes: [...routes.values()].sort((a, b) => a.route.localeCompare(b.route)),
    unresolved,
  };
}

async function detectProject() {
  const pkg = await readJson(path.join(rootDir, "package.json"));
  const packageManager = detectPackageManager(pkg);
  const appRouterRoots = (
    await Promise.all([path.join(rootDir, "app"), path.join(rootDir, "src", "app")].map(pathExists))
  )
    .map((exists, index) => (exists ? ["app", "src/app"][index] : null))
    .filter(Boolean);
  const pagesRouterRoots = (
    await Promise.all([path.join(rootDir, "pages"), path.join(rootDir, "src", "pages")].map(pathExists))
  )
    .map((exists, index) => (exists ? ["pages", "src/pages"][index] : null))
    .filter(Boolean);
  const storyFiles = (await walkFiles(rootDir)).filter((file) =>
    /\.(stories|story)\.(tsx|ts|jsx|js|mdx)$/.test(file),
  );
  const hasStorybookDir = await pathExists(path.join(rootDir, ".storybook"));
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
  const scripts = pkg.scripts || {};
  const storybookScript =
    ["storybook", "dev:storybook", "start-storybook"].find((script) => scripts[script]) || null;
  const storybookDetected =
    hasStorybookDir ||
    storyFiles.length > 0 ||
    Object.keys(allDeps).some((dep) => dep.includes("storybook")) ||
    Boolean(storybookScript);
  const routingSource = await readTextIfExists(path.join(rootDir, "i18n", "routing.ts"));
  const dataSource = await readTextIfExists(path.join(rootDir, "lib", "showroom-data.ts"));
  const adminSource = await readTextIfExists(path.join(rootDir, "components", "showroom", "admin-pages.tsx"));
  const nextConfigFiles = [];
  for (const file of ["next.config.ts", "next.config.mjs", "next.config.js"]) {
    if (await pathExists(path.join(rootDir, file))) nextConfigFiles.push(file);
  }

  const project = {
    cwd: rootDir,
    packageManager,
    packageManagerRaw: pkg.packageManager || null,
    scripts: {
      dev: scripts.dev || null,
      build: scripts.build || null,
      start: scripts.start || null,
      testE2e: scripts["test:e2e"] || null,
      screenshots: scripts.screenshots || null,
      storybook: storybookScript ? scripts[storybookScript] : null,
    },
    next: {
      appRouter: appRouterRoots.length > 0,
      pagesRouter: pagesRouterRoots.length > 0,
      appRouterRoots,
      pagesRouterRoots,
      configFiles: nextConfigFiles,
    },
    playwright: {
      installed: Boolean(allDeps["@playwright/test"]),
      configFiles: (await pathExists(path.join(rootDir, "playwright.config.ts")))
        ? ["playwright.config.ts"]
        : [],
    },
    storybook: {
      detected: storybookDetected,
      hasStorybookDir,
      script: storybookScript,
      storyFiles: storyFiles.map((file) => toPosixPath(path.relative(rootDir, file))),
    },
  };

  const discoveryContext = {
    locales: parseLocales(routingSource),
    productSlugs: parseSlugs(dataSource, /export const products\s*=\s*\[/, /export type Product/),
    blogSlugs: parseSlugs(dataSource, /export const blogPosts\s*=\s*\[/, /export const blogArticleContent/),
    adminSections: parseAdminSections(adminSource),
    adminCreateLinks: parseAdminCreateLinks(adminSource),
  };

  const discovered = await discoverAppRoutes(discoveryContext);

  return {
    project,
    discoveryContext,
    routes: discovered.routes,
    unresolvedRoutes: discovered.unresolved,
  };
}

function fileNameForRoute(route, profileKey) {
  const normalized = route
    .replace(/^https?:\/\//, "")
    .replace(/[?#]/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${normalized || "root"}-${profileKey}.png`;
}

function fileNameForStory(storyId, profileKey) {
  const normalized = storyId
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${normalized || "story"}-${profileKey}.png`;
}

async function disableAnimations(page) {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-delay: 0ms !important;
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-delay: 0ms !important;
        transition-duration: 0ms !important;
      }
      video {
        animation: none !important;
      }
    `,
  });
}

async function waitForNetworkIdle(page, timeout = 5000) {
  await page.waitForLoadState("networkidle", { timeout }).catch(() => {});
}

async function waitForImages(page, timeout = 3500) {
  await page
    .evaluate(async (waitMs) => {
      const images = Array.from(document.images);
      await Promise.race([
        Promise.all(
          images
            .filter((image) => !image.complete)
            .map(
              (image) =>
                new Promise((resolve) => {
                  image.addEventListener("load", resolve, { once: true });
                  image.addEventListener("error", resolve, { once: true });
                }),
            ),
        ),
        new Promise((resolve) => setTimeout(resolve, waitMs)),
      ]);
    }, timeout)
    .catch(() => {});
}

async function autoScroll(page) {
  await page
    .evaluate(async () => {
      await new Promise((resolve) => {
        let steps = 0;
        let stableHeightTicks = 0;
        let previousHeight = 0;
        const timer = window.setInterval(() => {
          const height = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
          );
          const step = Math.max(360, Math.floor(window.innerHeight * 0.82));

          if (height === previousHeight) {
            stableHeightTicks += 1;
          } else {
            stableHeightTicks = 0;
            previousHeight = height;
          }

          window.scrollBy(0, step);
          steps += 1;

          const reachedBottom = window.scrollY + window.innerHeight >= height - 2;
          if (steps >= 80 || (reachedBottom && stableHeightTicks >= 2)) {
            window.clearInterval(timer);
            resolve(undefined);
          }
        }, 80);
      });
    })
    .catch(() => {});
}

async function settleForScreenshot(page) {
  await waitForNetworkIdle(page, 2000);
  await disableAnimations(page).catch(() => {});
  await waitForImages(page, 1500);
  await autoScroll(page);
  await waitForNetworkIdle(page, 1200);
  await waitForImages(page, 1000);
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
  await page.waitForTimeout(200);
}

async function pageMetrics(page) {
  return page.evaluate(() => ({
    title: document.title,
    url: window.location.href,
    scrollHeight: Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    ),
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
    loadedImages: Array.from(document.images).filter(
      (image) => image.complete && image.naturalWidth > 0,
    ).length,
    totalImages: document.images.length,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    bodyTextLength: document.body.innerText.length,
    h1: document.querySelector("h1")?.textContent?.trim() || null,
  }));
}

async function capturePage(browser, route, profile, serverBaseURL) {
  const outputPath = path.join(profile.outputDir, fileNameForRoute(route.route, profile.key));
  const context = await browser.newContext({
    ...profile.context,
    baseURL: serverBaseURL,
  });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  try {
    const response = await page.goto(route.route, {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });
    await settleForScreenshot(page);
    const metrics = await pageMetrics(page);
    await page.screenshot({ path: outputPath, fullPage: true });

    const statusCode = response?.status() ?? null;
    const failureReason =
      statusCode && statusCode >= 400 ? `HTTP ${statusCode}` : null;

    return {
      status: failureReason ? "failure" : "success",
      reason: failureReason,
      file: relativeArtifact(outputPath),
      profile: profile.label,
      device: profile.deviceName,
      statusCode,
      finalUrl: metrics.url,
      metrics,
      pageErrors,
      consoleErrors: consoleErrors.slice(0, 20),
      fullPage: true,
    };
  } catch (error) {
    return {
      status: "failure",
      reason: error instanceof Error ? error.message : String(error),
      file: null,
      profile: profile.label,
      device: profile.deviceName,
      statusCode: null,
      finalUrl: page.url(),
      metrics: null,
      pageErrors,
      consoleErrors: consoleErrors.slice(0, 20),
      fullPage: true,
    };
  } finally {
    await context.close();
  }
}

async function getStorybookStories(storybookBaseURL) {
  const response = await fetchWithTimeout(`${storybookBaseURL}/index.json`, 15_000);
  if (!response.ok) throw new Error(`Storybook index.json returned HTTP ${response.status}`);
  const index = await response.json();
  const entries = Object.values(index.entries || {});
  return entries
    .filter((entry) => entry.type === "story")
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      name: entry.name,
      importPath: entry.importPath || null,
    }));
}

async function captureStory(browser, story, profile, storybookBaseURL) {
  const outputPath = path.join(profile.componentDir, fileNameForStory(story.id, profile.key));
  const context = await browser.newContext({
    ...profile.context,
    baseURL: storybookBaseURL,
  });
  const page = await context.newPage();
  const pageErrors = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));

  try {
    const response = await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`, {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });
    await settleForScreenshot(page);
    const metrics = await pageMetrics(page);
    await page.screenshot({ path: outputPath, fullPage: true });

    const statusCode = response?.status() ?? null;
    const failureReason =
      statusCode && statusCode >= 400 ? `HTTP ${statusCode}` : null;

    return {
      status: failureReason ? "failure" : "success",
      reason: failureReason,
      file: relativeArtifact(outputPath),
      profile: profile.label,
      device: profile.deviceName,
      statusCode,
      finalUrl: metrics.url,
      metrics,
      pageErrors,
      fullPage: true,
    };
  } catch (error) {
    return {
      status: "failure",
      reason: error instanceof Error ? error.message : String(error),
      file: null,
      profile: profile.label,
      device: profile.deviceName,
      statusCode: null,
      finalUrl: page.url(),
      metrics: null,
      pageErrors,
      fullPage: true,
    };
  } finally {
    await context.close();
  }
}

async function writeManifest(manifest) {
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function main() {
  await ensureOutputDirs();

  const detected = await detectProject();
  const routeLimit = Number.parseInt(process.env.SCREENSHOT_ROUTE_LIMIT || "", 10);
  const routesToCapture =
    Number.isFinite(routeLimit) && routeLimit > 0
      ? detected.routes.slice(0, routeLimit)
      : detected.routes;
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseURL,
    artifactRoot: relativeArtifact(artifactRoot),
    project: detected.project,
    discovery: {
      locales: detected.discoveryContext.locales,
      productSlugs: detected.discoveryContext.productSlugs,
      blogSlugs: detected.discoveryContext.blogSlugs,
      adminSections: detected.discoveryContext.adminSections,
      adminCreateLinks: detected.discoveryContext.adminCreateLinks,
      routesFound: detected.routes.length,
      routesCaptured: routesToCapture.length,
      routeLimit: Number.isFinite(routeLimit) && routeLimit > 0 ? routeLimit : null,
      unresolvedRoutes: detected.unresolvedRoutes,
      notes: [
        "Pages are discovered from App Router page files.",
        "Dynamic product and blog slugs are resolved from lib/showroom-data.ts.",
        "Mobile screenshots use Playwright's iPhone 13 device emulation.",
      ],
    },
    profiles: profiles.map((profile) => ({
      key: profile.key,
      label: profile.label,
      device: profile.deviceName,
      viewport: profile.context.viewport,
      isMobile: Boolean(profile.context.isMobile),
      hasTouch: Boolean(profile.context.hasTouch),
    })),
    pages: [],
    storybook: {
      detected: detected.project.storybook.detected,
      script: detected.project.storybook.script,
      storyFiles: detected.project.storybook.storyFiles,
      storiesFound: 0,
      stories: [],
      errors: detected.project.storybook.detected
        ? []
        : ["Storybook not detected: no .storybook directory, Storybook dependency/script, or *.stories.* files found."],
    },
    summary: {
      pageScreenshots: { total: 0, success: 0, failure: 0 },
      componentScreenshots: { total: 0, success: 0, failure: 0 },
    },
  };

  await writeManifest(manifest);

  let appServer;
  let storybookServer;
  const browser = await chromium.launch();

  try {
    appServer = await startAppServer(detected.project);
    manifest.server = {
      baseURL: appServer.baseURL,
      started: appServer.started,
      command: appServer.command,
    };
    await writeManifest(manifest);

    for (const route of routesToCapture) {
      const pageRecord = {
        route: route.route,
        source: route.source,
        type: route.type,
        params: route.params,
        screenshots: {},
      };

      for (const profile of profiles) {
        const result = await capturePage(browser, route, profile, appServer.baseURL);
        pageRecord.screenshots[profile.key] = result;
        manifest.summary.pageScreenshots.total += 1;
        manifest.summary.pageScreenshots[result.status] += 1;
      }

      manifest.pages.push(pageRecord);
      await writeManifest(manifest);
      console.log(`Captured page ${route.route}`);
    }

    if (detected.project.storybook.detected) {
      try {
        storybookServer = await startStorybook(detected.project, detected.project.storybook);
        manifest.storybook.server = {
          baseURL: storybookServer.baseURL,
          started: storybookServer.started,
          command: storybookServer.command,
        };
        const stories = await getStorybookStories(storybookServer.baseURL);
        manifest.storybook.storiesFound = stories.length;

        for (const story of stories) {
          const storyRecord = {
            ...story,
            screenshots: {},
          };

          for (const profile of profiles) {
            const result = await captureStory(browser, story, profile, storybookServer.baseURL);
            storyRecord.screenshots[profile.key] = result;
            manifest.summary.componentScreenshots.total += 1;
            manifest.summary.componentScreenshots[result.status] += 1;
          }

          manifest.storybook.stories.push(storyRecord);
          await writeManifest(manifest);
          console.log(`Captured story ${story.id}`);
        }
      } catch (error) {
        manifest.storybook.errors.push(error instanceof Error ? error.message : String(error));
      }
    }
  } finally {
    await browser.close();
    await storybookServer?.stop();
    await appServer?.stop();
  }

  manifest.completedAt = new Date().toISOString();
  await writeManifest(manifest);

  console.log(
    `Screenshots complete: ${manifest.summary.pageScreenshots.success}/${manifest.summary.pageScreenshots.total} page captures succeeded.`,
  );
  console.log(`Manifest: ${relativeArtifact(manifestPath)}`);
}

main().catch(async (error) => {
  await ensureOutputDirs();
  const failureManifest = {
    generatedAt: new Date().toISOString(),
    status: "fatal",
    reason: error instanceof Error ? error.message : String(error),
  };
  await fs.writeFile(manifestPath, `${JSON.stringify(failureManifest, null, 2)}\n`, "utf8");
  console.error(error);
  process.exitCode = 1;
});
