import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const args = process.argv.slice(2);
  
  // Parse --json flag
  let isJsonOutput = false;
  const jsonIndex = args.findIndex(arg => arg === '--json');
  if (jsonIndex !== -1) {
    isJsonOutput = true;
    args.splice(jsonIndex, 1);
  }

  // Logger helper: route status logs to stderr if --json is active, stdout otherwise
  const log = (...logArgs) => {
    if (isJsonOutput) {
      console.error(...logArgs);
    } else {
      console.log(...logArgs);
    }
  };

  const logError = (...errArgs) => {
    console.error(...errArgs);
  };

  // Output helper for final JSON
  const outputJson = (data) => {
    if (isJsonOutput) {
      console.log(JSON.stringify(data, null, 2));
    }
  };

  // Parse --profile <name> or environment variable SPARK_PROFILE
  let profileName = process.env.SPARK_PROFILE || null;
  const profileIndex = args.findIndex(arg => arg === '--profile' || arg === '-p');
  if (profileIndex !== -1 && profileIndex + 1 < args.length) {
    profileName = args[profileIndex + 1];
    args.splice(profileIndex, 2);
  }

  const profileFolder = profileName ? `chrome-profile-${profileName}` : 'chrome-profile';
  const GLOBAL_PROFILE_DIR = 'C:\\Users\\ibrah\\.gemini\\config\\skills\\gemini-spark';
  const GLOBAL_PROFILE = path.resolve(GLOBAL_PROFILE_DIR, profileFolder);
  const USER_DATA_DIR = fs.existsSync(GLOBAL_PROFILE) ? GLOBAL_PROFILE : path.resolve(__dirname, `../${profileFolder}`);

  // Parse --no-wait flag
  let noWait = false;
  const noWaitIndex = args.findIndex(arg => arg === '--no-wait');
  if (noWaitIndex !== -1) {
    noWait = true;
    args.splice(noWaitIndex, 1);
  }

  // Parse subcommands: wait, list, ask
  let subcommand = null;
  if (args.length > 0 && ['wait', 'list', 'ask'].includes(args[0].toLowerCase())) {
    subcommand = args.shift().toLowerCase();
  }

  // Parse --file or -f
  let filePath = null;
  const fileIndex = args.findIndex(arg => arg === '--file' || arg === '-f');
  if (fileIndex !== -1 && fileIndex + 1 < args.length) {
    filePath = args[fileIndex + 1];
    args.splice(fileIndex, 2);
  }

  // Parse --list or -l
  let shouldList = subcommand === 'list';
  const listIndex = args.findIndex(arg => arg === '--list' || arg === '-l');
  if (listIndex !== -1) {
    shouldList = true;
    args.splice(listIndex, 1);
  }

  // Parse --new or -n or --new-chat
  let shouldStartNew = false;
  const newIndex = args.findIndex(arg => arg === '--new' || arg === '-n' || arg === '--new-chat');
  if (newIndex !== -1) {
    shouldStartNew = true;
    args.splice(newIndex, 1);
  }

  // Parse --continue or -c
  let continueTarget = null;
  let shouldContinue = false;
  const continueIndex = args.findIndex(arg => arg === '--continue' || arg === '-c');
  if (continueIndex !== -1) {
    shouldContinue = true;
    const nextArg = args[continueIndex + 1];
    if (continueIndex + 1 < args.length && !nextArg.startsWith('-') && (/^\d+$/.test(nextArg) || /^[a-f0-9]{16}$/.test(nextArg))) {
      continueTarget = nextArg;
      args.splice(continueIndex, 2);
    } else {
      args.splice(continueIndex, 1);
    }
  }

  // Handle subcommand: wait
  let isWaitSubcommand = subcommand === 'wait';
  let waitTargetId = null;
  if (isWaitSubcommand) {
    if (args.length > 0 && !args[0].startsWith('-')) {
      waitTargetId = args.shift();
    }
    shouldContinue = true;
    if (waitTargetId) continueTarget = waitTargetId;
  }

  // DEFAULT BEHAVIOR: Automatically continue active conversation unless user requested a new chat or listing
  if (!shouldStartNew && !shouldContinue && !shouldList && !isWaitSubcommand) {
    shouldContinue = true;
  }
  
  // Parse --deep or -d
  let isDeep = false;
  const deepIndex = args.findIndex(arg => arg === '--deep' || arg === '-d');
  if (deepIndex !== -1) {
    isDeep = true;
    args.splice(deepIndex, 1);
  }

  // Parse --image or -i
  let isImage = false;
  const imageIndex = args.findIndex(arg => arg === '--image' || arg === '-i');
  if (imageIndex !== -1) {
    isImage = true;
    args.splice(imageIndex, 1);
  }
  
  const prompt = args.join(' ');
  
  if (!shouldList && !isWaitSubcommand && !prompt && !filePath) {
    log('Usage: node index.js [ask|wait|list] [--new] [--continue <index_or_id>] [--profile <name>] [--no-wait] [--json] [--file path/to/file] "your prompt here"');
    if (isJsonOutput) {
      outputJson({ status: "error", error: "Missing required prompt, file, or subcommand" });
    }
    return;
  }
  
  let absoluteFilePath = null;
  if (filePath) {
    absoluteFilePath = path.resolve(filePath);
    if (!fs.existsSync(absoluteFilePath)) {
      logError(`[ERROR] File not found: ${absoluteFilePath}`);
      if (isJsonOutput) {
        outputJson({ status: "error", error: `File not found: ${absoluteFilePath}` });
      }
      process.exit(1);
    }
  }

  // Ensure user data profile directory exists
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  // 1. List conversations logic
  if (shouldList) {
    log(`Starting headless Chrome with profile: ${USER_DATA_DIR}`);
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: true,
      channel: 'chrome',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await context.newPage();
    try {
      log('Navigating directly to Spark tasks list...');
      await page.goto('https://gemini.google.com/spark/tasks', { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Check if redirected to Google Login page
      if (page.url().includes('accounts.google.com')) {
        logError('\n[ERROR] Oturum açılmamış! (Not logged in)');
        if (isJsonOutput) outputJson({ status: "error", error: "Not logged in" });
        await context.close();
        process.exit(1);
      }

      await page.waitForTimeout(4000);
      
      try {
        await page.waitForSelector('div.goal-card', { timeout: 15000 });
        log('Task cards loaded.');
      } catch (e) {
        log('No task cards loaded or timeout occurred.');
      }
      await page.waitForTimeout(2000);
      
      let chats = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div.goal-card'));
        return cards.map(card => {
          const idAttr = card.getAttribute('id') || '';
          const match = idAttr.match(/^goal-c_([a-f0-9]+)$/);
          const titleEl = card.querySelector('.goal-description');
          const isScheduled = !!card.querySelector('.scheduled-icon') || !!card.querySelector('[fonticonname="schedule"]');
          return {
            id: match ? match[1] : null,
            title: titleEl ? (titleEl.innerText || '').trim() : 'Görev',
            isScheduled
          };
        }).filter(c => c.id);
      });
      
      if (chats.length === 0) {
        log('No goal-card tasks found on Spark tasks page. Navigating to main app page to list recent conversations...');
        try {
          await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(3000);

          const openSidebarBtn = page.locator('button[aria-label*="sidebar" i], button[aria-label*="menu" i], button[aria-label*="menü" i]').first();
          if (await openSidebarBtn.count() > 0) {
            await openSidebarBtn.click({ force: true }).catch(() => {});
            await page.waitForTimeout(2500);
          }

          const recentsToggle = page.locator('button[aria-label*="recents" i]').first();
          if (await recentsToggle.count() > 0) {
            await recentsToggle.click({ force: true }).catch(() => {});
            await page.waitForTimeout(2000);
          }

          await page.waitForFunction(() => {
            const links = document.querySelectorAll('a[href*="/app/"], a[href*="/spark/chat/"]');
            return Array.from(links).some(l => {
              const h = l.getAttribute('href') || '';
              return h && !h.includes('download') && !h.includes('accounts.google.com') && h !== '/app';
            });
          }, { timeout: 8000 }).catch(() => null);

          const recentChats = await page.evaluate(() => {
            const links = document.querySelectorAll('a[href*="/app/"], a[href*="/spark/chat/"]');
            const results = [];
            links.forEach(l => {
              const href = l.getAttribute('href') || '';
              if (href && !href.includes('download') && !href.includes('accounts.google.com') && href !== '/app') {
                const match = href.match(/\/app\/([a-f0-9]+)/) || href.match(/\/spark\/chat\/([a-f0-9]+)/);
                const id = match ? match[1] : href;
                const title = (l.innerText || '').trim() || 'Sohbet';
                results.push({ id, title, isScheduled: false });
              }
            });
            return results;
          });

          if (recentChats.length > 0) {
            chats = recentChats;
          }
        } catch (fallbackErr) {
          log('[WARN] Recent chats fallback failed:', fallbackErr.message);
        }
      }

      if (isJsonOutput) {
        outputJson({ status: "ok", count: chats.length, chats });
      } else {
        if (chats.length === 0) {
          log('Spark sohbet geçmişi bulunamadı.');
        } else {
          log('\n--- GEMINI SPARK SOHBETLERİ ---');
          chats.forEach((chat, idx) => {
            const scheduledLabel = chat.isScheduled ? ' ⏱️ [Zamanlanmış]' : '';
            log(`[${idx + 1}] ${chat.title} (ID: ${chat.id})${scheduledLabel}`);
          });
          log('-------------------------------\n');
        }
      }

      const cacheFile = path.resolve(__dirname, '../last-chat-list.json');
      fs.writeFileSync(cacheFile, JSON.stringify(chats, null, 2), 'utf8');

    } catch (err) {
      logError('Error fetching chats:', err);
      if (isJsonOutput) outputJson({ status: "error", error: err.message });
    } finally {
      try {
        await context.close();
      } catch (e) {}
      process.exit(0);
    }
  }

  log(`Starting headless Chrome with profile: ${USER_DATA_DIR}`);
  
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    channel: 'chrome',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ],
    viewport: { width: 1600, height: 950 }
  });
  
  const page = await context.newPage();
  const downloadedFiles = [];

  try {
    log('Navigating to Gemini...');
    let targetUrl = 'https://gemini.google.com/app';
    const lastChatFile = path.resolve(__dirname, '../last-chat-url.txt');
    const cacheFile = path.resolve(__dirname, '../last-chat-list.json');
    
    if (shouldStartNew && fs.existsSync(lastChatFile)) {
      try {
        fs.unlinkSync(lastChatFile);
        log('[INFO] Starting a new chat context as requested by --new flag.');
      } catch (e) {}
    }
    
    if (shouldContinue) {
      let chatId = null;
      
      if (continueTarget) {
        const targetIndex = parseInt(continueTarget, 10);
        if (!isNaN(targetIndex) && fs.existsSync(cacheFile)) {
          const chats = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
          if (targetIndex >= 1 && targetIndex <= chats.length) {
            chatId = chats[targetIndex - 1].id;
            log(`Index ${targetIndex} resolved to Chat ID: ${chatId}`);
          } else {
            logError(`[ERROR] Invalid index: ${targetIndex}. Available indices: 1 to ${chats.length}`);
            if (isJsonOutput) outputJson({ status: "error", error: `Invalid index: ${targetIndex}` });
            await context.close();
            process.exit(1);
          }
        } else {
          chatId = continueTarget;
        }
      } else if (fs.existsSync(lastChatFile)) {
        const savedUrl = fs.readFileSync(lastChatFile, 'utf8').trim();
        if (savedUrl && savedUrl.startsWith('https://gemini.google.com/')) {
          targetUrl = savedUrl;
          log(`Continuing conversation from saved URL: ${targetUrl}`);
        }
      }
      
      if (continueTarget && chatId) {
        targetUrl = `https://gemini.google.com/app/${chatId}`;
        log(`Continuing conversation from: ${targetUrl}`);
      } else if (!targetUrl || targetUrl === 'https://gemini.google.com/app') {
        if (!fs.existsSync(lastChatFile) && !continueTarget) {
          log('No previous conversation found to continue. Starting a new chat.');
        }
      }
    }

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    if (shouldContinue && targetUrl !== 'https://gemini.google.com/app') {
      log('Waiting for previous conversation history to load...');
      await page.waitForTimeout(4000);
      try {
        await page.waitForSelector('message-content, model-response, .model-response', { timeout: 8000 }).catch(() => null);
      } catch (e) {}
    }

    if (shouldContinue) {
      const hasHistory = await page.evaluate(() => {
        const text = (document.body.innerText || '');
        return text.includes('You said') || text.includes('Gemini said') || document.querySelectorAll('message-content, model-response, .model-response').length > 0;
      });

      if (!hasHistory) {
        log('Conversation history not loaded directly. Attempting to resolve active conversation from Gemini sidebar...');
        try {
          if (page.url() !== 'https://gemini.google.com/app') {
            await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(3000);
          }

          const openSidebarBtn = page.locator('button[aria-label="Open sidebar"], button[aria-label*="Menü" i]').first();
          if (await openSidebarBtn.count() > 0) {
            await openSidebarBtn.click({ force: true }).catch(() => {});
            await page.waitForTimeout(2000);
          }

          const recentsToggle = page.locator('button[aria-label="Toggle Recents"]').first();
          if (await recentsToggle.count() > 0) {
            await recentsToggle.click({ force: true }).catch(() => {});
            await page.waitForTimeout(1500);
          }

          const topHref = await page.evaluate(() => {
            const links = document.querySelectorAll('a[href*="/app/"], a[href*="/spark/chat/"]');
            for (const l of links) {
              const h = l.getAttribute('href') || '';
              if (h && !h.includes('download') && !h.includes('accounts.google.com') && h !== '/app') {
                return h;
              }
            }
            return null;
          });

          if (topHref) {
            targetUrl = `https://gemini.google.com${topHref}`;
            log(`[INFO] Continuing conversation from top recent chat: ${targetUrl}`);
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(3000);
          } else {
            log('[WARN] No previous chats found in sidebar.');
          }
        } catch (sidebarErr) {
          log('[WARN] Sidebar resolution failed:', sidebarErr.message);
        }
      }
    }
    
    // Check if redirected to Google Login page
    const currentUrl = page.url();
    if (currentUrl.includes('accounts.google.com')) {
      logError('PowerShell:');
      logError(`  Start-Process "chrome" -ArgumentList "--remote-debugging-port=9222", "--user-data-dir=${USER_DATA_DIR}", "https://gemini.google.com"\n`);
      logError('CMD:');
      logError(`  start chrome --remote-debugging-port=9222 --user-data-dir="${USER_DATA_DIR}" https://gemini.google.com\n`);
      if (isJsonOutput) outputJson({ status: "error", error: "Not logged in" });
      await context.close();
      process.exit(1);
    }

    // If running wait subcommand, wait for generation completion directly
    if (isWaitSubcommand) {
      log('Subcommand wait: Monitoring response generation...');
      await page.waitForSelector('message-content, model-response, .model-response', { timeout: 30000 });
      let stableCount = 0;
      let lastLen = 0;
      while (stableCount < 4) {
        await page.waitForTimeout(2000);
        const currentLen = await page.evaluate(() => document.body.innerText.length);
        if (currentLen === lastLen && currentLen > 50) {
          stableCount++;
        } else {
          stableCount = 0;
          lastLen = currentLen;
        }
      }

      const responseText = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('message-content, model-response, .model-response'));
        return els.length > 0 ? els[els.length - 1].innerText : '';
      });

      const threadIdMatch = page.url().match(/\/app\/([a-f0-9]+)/) || page.url().match(/\/spark\/chat\/([a-f0-9]+)/);
      const threadId = threadIdMatch ? threadIdMatch[1] : null;

      if (isJsonOutput) {
        outputJson({
          status: "completed",
          thread_id: threadId,
          url: page.url(),
          response: responseText
        });
      } else {
        console.log('\n--- GEMINI SPARK RESPONSE ---');
        console.log(responseText);
        console.log('-----------------------------\n');
      }
      return;
    }

    log('Gemini loaded. Finding input textbox...');
    const textboxSelector = '[role="textbox"], div[contenteditable="true"]';
    await page.waitForSelector(textboxSelector, { timeout: 15000 });
    const textbox = page.locator(textboxSelector).first();
    
    // Toggle Deep Research / Thinking Mode if --deep is requested
    if (isDeep) {
      log('Attempting to activate Deep Research mode...');
      try {
        const isAlreadyActive = await page.evaluate(() => {
          const btn = document.querySelector('button[aria-label*="Deselect Deep research" i], button[aria-label*="Deep research" i]');
          return btn ? (btn.getAttribute('aria-label') || '').toLowerCase().includes('deselect') : false;
        });

        if (!isAlreadyActive) {
          const deepBtn = page.locator('button[aria-label*="Deep research" i]').first();
          if (await deepBtn.count() > 0) {
            await deepBtn.click();
            log('[OK] Deep Research mode toggled ON.');
            await page.waitForTimeout(1000);
          } else {
            log('[WARN] Deep research button not found on page.');
          }
        } else {
          log('[OK] Deep Research mode is already active.');
        }
      } catch (deepErr) {
        log('[WARN] Failed to toggle Deep Research:', deepErr.message);
      }
    }
    
    // Upload File if provided
    if (absoluteFilePath) {
      log(`Uploading file: ${absoluteFilePath}`);
      const fileInputSelector = 'input[type="file"]';
      
      const fileInputCount = await page.locator(fileInputSelector).count();
      if (fileInputCount === 0) {
        log('File input not found directly. Looking for Upload/Plus button...');
        const uploadBtnSelector = 'button[aria-label*="Upload" i], button[aria-label*="Yükle" i], button[aria-label*="Add" i], button[aria-label*="Ekle" i]';
        const uploadBtn = page.locator(uploadBtnSelector).first();
        if (await uploadBtn.count() > 0) {
          await uploadBtn.click();
          await page.waitForTimeout(1000);
        }
      }

      const fileInput = page.locator(fileInputSelector).first();
      await fileInput.setInputFiles(absoluteFilePath);
      log('File uploaded successfully. Waiting for upload processing...');
      await page.waitForTimeout(3000);
    }
    
    // Count response elements prior to sending
    const initialCounts = await page.evaluate(() => {
      const selectors = ['message-content', 'shared-response-renderer', 'inline-response-renderer', 'model-response', '.model-response', 'div[class*="model-response"]', 'div[class*="response"]', 'response-container', '.response-container'];
      const counts = {};
      selectors.forEach(sel => {
        counts[sel] = document.querySelectorAll(sel).length;
      });
      return counts;
    });
    log('Initial response counts:', JSON.stringify(initialCounts));

    // Input prompt via realistic keystrokes
    log('Typing prompt with realistic keystrokes...');
    await textbox.click();
    await page.keyboard.type(prompt, { delay: 5 });
    await page.waitForTimeout(1000);
    
    log('Sending message...');
    const sendButtonSelector = 'button[aria-label*="Send" i], button[aria-label*="Gönder" i], button.send-button';
    const sendBtn = page.locator(sendButtonSelector).first();
    if (await sendBtn.count() > 0 && await sendBtn.isVisible() && await sendBtn.isEnabled()) {
      await sendBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }
    
    await page.waitForTimeout(2000);

    // If --no-wait is passed, exit early returning pending status
    if (noWait) {
      log('Async --no-wait flag detected. Capturing thread URL and returning pending status...');
      await page.waitForTimeout(4000);
      let currentThreadUrl = page.url();
      if (currentThreadUrl.includes('/spark/chat/') || (currentThreadUrl.startsWith('https://gemini.google.com/app/') && currentThreadUrl !== 'https://gemini.google.com/app')) {
        const lastChatFile = path.resolve(__dirname, '../last-chat-url.txt');
        fs.writeFileSync(lastChatFile, currentThreadUrl, 'utf8');
      }
      const match = currentThreadUrl.match(/\/app\/([a-f0-9]+)/) || currentThreadUrl.match(/\/spark\/chat\/([a-f0-9]+)/);
      const threadId = match ? match[1] : null;

      if (isJsonOutput) {
        outputJson({
          status: "pending",
          thread_id: threadId,
          url: currentThreadUrl
        });
      } else {
        log(`[INFO] Async task submitted. Thread ID: ${threadId || 'pending'}`);
        log(`[INFO] URL: ${currentThreadUrl}`);
      }
      return;
    }

    log('Waiting for response to generate...');
    
    let isStable = false;
    let attempts = 0;
    const maxAttempts = 60; // Up to 120 seconds
    let lastLength = 0;
    
    while (!isStable && attempts < maxAttempts) {
      await page.waitForTimeout(2000);
      attempts++;
      
      const currentLength = await page.evaluate((initCounts) => {
        const selectors = ['message-content', 'shared-response-renderer', 'inline-response-renderer', 'model-response', '.model-response', 'div[class*="model-response"]', 'div[class*="response"]', 'response-container', '.response-container'];
        
        let latestEl = null;
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          const initialVal = initCounts[selector] || 0;
          if (elements.length > initialVal) {
            latestEl = elements[elements.length - 1];
            break;
          }
        }
        if (!latestEl) {
          const divs = Array.from(document.querySelectorAll('div'));
          const candidates = divs.filter(d => d.className && d.className.includes('response') && d.innerText && d.innerText.length > 10);
          if (candidates.length > 0) {
            latestEl = candidates[candidates.length - 1];
          }
        }
        
        return latestEl ? (latestEl.innerText || '').length : 0;
      }, initialCounts);
      
      const stopBtn = page.locator('button[aria-label*="Stop" i], button[aria-label*="Durdur" i]').first();
      const isStopVisible = await stopBtn.count() > 0 && await stopBtn.isVisible();
      
      if (currentLength > 0 && currentLength === lastLength && !isStopVisible) {
        isStable = true;
        log('Generation completed (text is fully stable and Stop button is hidden).');
      } else {
        lastLength = currentLength;
      }
    }
    
    const responseText = await page.evaluate(() => {
      const selectors = ['message-content', 'model-response', '.model-response', 'div.markdown', 'div[class*="response-container"]', 'div[class*="response"]'];
      for (const sel of selectors) {
        const els = Array.from(document.querySelectorAll(sel));
        if (els.length > 0) {
          const text = (els[els.length - 1].innerText || '').trim();
          if (text.length > 5) return text;
        }
      }
      return 'No response captured.';
    });
    
    if (!isJsonOutput) {
      console.log('\n--- GEMINI SPARK RESPONSE ---');
      console.log(responseText);
      console.log('-----------------------------\n');
    }
    
    // Auto-downloader for Google Workspace Items
    log('Scanning response for Google Workspace export links...');
    const googleWorkspaceLinks = await page.evaluate((initCounts) => {
      const selectors = ['message-content', 'shared-response-renderer', 'inline-response-renderer', 'model-response', '.model-response', 'div[class*="model-response"]', 'div[class*="response"]', 'response-container', '.response-container'];
      
      let latestEl = null;
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        const initialVal = initCounts[selector] || 0;
        if (elements.length > initialVal) {
          latestEl = elements[elements.length - 1];
          break;
        }
      }
      if (!latestEl) {
        const divs = Array.from(document.querySelectorAll('div'));
        const candidates = divs.filter(d => d.className && d.className.includes('response') && d.innerText && d.innerText.length > 10);
        if (candidates.length > 0) {
          latestEl = candidates[candidates.length - 1];
        }
      }
      if (!latestEl) return [];

      const links = Array.from(latestEl.querySelectorAll('a[href]'));
      return links.map(a => ({
        href: a.getAttribute('href'),
        text: a.innerText
      })).filter(l => l.href && (l.href.includes('docs.google.com') || l.href.includes('drive.google.com')));
    }, initialCounts);

    if (googleWorkspaceLinks.length > 0) {
      log(`Found ${googleWorkspaceLinks.length} Google Workspace items. Downloading...`);
      for (const link of googleWorkspaceLinks) {
        try {
          let exportUrl = null;
          let filename = null;
          
          if (link.href.includes('/document/d/')) {
            const docIdMatch = link.href.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
            if (docIdMatch) {
              const docId = docIdMatch[1];
              exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
              filename = `downloaded-doc-${docId}.txt`;
            }
          } else if (link.href.includes('/spreadsheets/d/')) {
            const sheetIdMatch = link.href.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
            if (sheetIdMatch) {
              const sheetId = sheetIdMatch[1];
              exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
              filename = `downloaded-sheet-${sheetId}.xlsx`;
            }
          } else if (link.href.includes('/presentation/d/')) {
            const slideIdMatch = link.href.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
            if (slideIdMatch) {
              const slideId = slideIdMatch[1];
              exportUrl = `https://docs.google.com/presentation/d/${slideId}/export/pptx`;
              filename = `downloaded-slides-${slideId}.pptx`;
            }
          }
          
          if (exportUrl && filename) {
            log(`Downloading: ${filename} from ${exportUrl}`);
            const response = await page.request.get(exportUrl);
            if (response.ok()) {
              const buffer = await response.body();
              const localPath = path.resolve(__dirname, `../${filename}`);
              fs.writeFileSync(localPath, buffer);
              log(`[OK] File saved locally: ${localPath}`);
              
              const currentWorkingDir = process.cwd();
              const destPath = path.resolve(currentWorkingDir, filename);
              fs.copyFileSync(localPath, destPath);
              log(`[OK] Copied file to active directory: ${destPath}`);
              downloadedFiles.push(filename);
            } else {
              logError(`[ERROR] Download failed with status: ${response.status()}`);
            }
          }
        } catch (downloadErr) {
          logError('[ERROR] Failed during Google Workspace download:', downloadErr.message);
        }
      }
    }

    // Auto-downloader for Generated Images
    log('Scanning response for generated images...');
    let imageBlobs = [];
    try {
      imageBlobs = await page.evaluate((initCounts) => {
        const selectors = ['message-content', 'shared-response-renderer', 'inline-response-renderer', 'model-response', '.model-response', 'div[class*="model-response"]', 'div[class*="response"]', 'response-container', '.response-container'];
        
        let latestEl = null;
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          const initialVal = initCounts[selector] || 0;
          if (elements.length > initialVal) {
            latestEl = elements[elements.length - 1];
            break;
          }
        }
        if (!latestEl) {
          const divs = Array.from(document.querySelectorAll('div'));
          const candidates = divs.filter(d => d.className && d.className.includes('response') && d.innerText && d.innerText.length > 10);
          if (candidates.length > 0) {
            latestEl = candidates[candidates.length - 1];
          }
        }
        if (!latestEl) return [];

        function deepFindImages(root, results = []) {
          if (!root) return results;
          const imgs = root.querySelectorAll('img');
          imgs.forEach(img => {
            const src = img.getAttribute('src') || '';
            if (src.startsWith('blob:')) {
              results.push(src);
            }
          });
          const allElements = root.querySelectorAll('*');
          allElements.forEach(el => {
            if (el.shadowRoot) {
              deepFindImages(el.shadowRoot, results);
            }
          });
          return results;
        }

        return Array.from(new Set(deepFindImages(latestEl)));
      }, initialCounts);
    } catch (err) {
      log('[WARN] Error finding image blobs:', err.message);
    }

    if (imageBlobs.length > 0) {
      log(`[INFO] Found ${imageBlobs.length} generated image(s) in response. Downloading...`);
      for (let i = 0; i < imageBlobs.length; i++) {
        const blobUrl = imageBlobs[i];
        try {
          log(`[INFO] Downloading image ${i + 1}/${imageBlobs.length}...`);
          const base64Data = await page.evaluate(async (url) => {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          }, blobUrl);

          const base64Content = base64Data.split(';base64,').pop();
          const buffer = Buffer.from(base64Content, 'base64');
          
          const timestamp = Date.now();
          const filename = `generated-image-${timestamp}-${i}.png`;
          const localPath = path.resolve(__dirname, `../${filename}`);
          
          fs.writeFileSync(localPath, buffer);
          log(`[OK] Image downloaded locally: ${localPath}`);
          
          const currentWorkingDir = process.cwd();
          const destPath = path.resolve(currentWorkingDir, filename);
          fs.copyFileSync(localPath, destPath);
          log(`[OK] Copied image to active directory: ${destPath}`);
          downloadedFiles.push(filename);
        } catch (imgErr) {
          logError(`[WARNING] Could not download image ${i + 1}:`, imgErr.message);
        }
      }
    }
    
    // Wait for session synchronization and URL update
    log('Saving conversation state and syncing with Google servers...');
    await page.waitForTimeout(6500);
    let finalUrl = page.url();
    if (finalUrl === 'https://gemini.google.com/app' || finalUrl === 'https://gemini.google.com/spark') {
      try {
        await page.waitForURL(url => {
          const u = url.toString();
          return (u.includes('/app/') && u !== 'https://gemini.google.com/app') || u.includes('/spark/chat/');
        }, { timeout: 10000 }).catch(() => null);
        finalUrl = page.url();
      } catch (e) {}
    }
    
    if (finalUrl.includes('/spark/chat/') || (finalUrl.startsWith('https://gemini.google.com/app/') && finalUrl !== 'https://gemini.google.com/app')) {
      const lastChatFile = path.resolve(__dirname, '../last-chat-url.txt');
      fs.writeFileSync(lastChatFile, finalUrl, 'utf8');
      log(`[INFO] Conversation saved: ${finalUrl}`);
    }

    const match = finalUrl.match(/\/app\/([a-f0-9]+)/) || finalUrl.match(/\/spark\/chat\/([a-f0-9]+)/);
    const threadId = match ? match[1] : null;

    if (isJsonOutput) {
      outputJson({
        status: "ok",
        thread_id: threadId,
        url: finalUrl,
        response: responseText,
        downloaded_files: downloadedFiles
      });
    }

  } catch (error) {
    logError('An error occurred during execution:', error);
    if (isJsonOutput) {
      outputJson({ status: "error", error: error.message });
    }
  } finally {
    try {
      if (page) await page.close().catch(() => {});
      log('Flushing session data to disk...');
      await new Promise(resolve => setTimeout(resolve, 4000));
      if (context) await context.close().catch(() => {});
    } catch (e) {}
    process.exit(0);
  }
}

run().catch(console.error);
