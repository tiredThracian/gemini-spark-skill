import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GLOBAL_PROFILE = 'C:\\Users\\ibrah\\.gemini\\config\\skills\\gemini-spark\\chrome-profile';
const USER_DATA_DIR = fs.existsSync(GLOBAL_PROFILE) ? GLOBAL_PROFILE : path.resolve(__dirname, '../chrome-profile');

async function run() {
  const args = process.argv.slice(2);
  
  // Parse arguments to look for --file or -f
  let filePath = null;
  const fileIndex = args.findIndex(arg => arg === '--file' || arg === '-f');
  if (fileIndex !== -1 && fileIndex + 1 < args.length) {
    filePath = args[fileIndex + 1];
    args.splice(fileIndex, 2);
  }
  
  // Parse arguments to look for --list or -l
  let shouldList = false;
  const listIndex = args.findIndex(arg => arg === '--list' || arg === '-l');
  if (listIndex !== -1) {
    shouldList = true;
    args.splice(listIndex, 1);
  }
  
  // Parse arguments to look for --new or -n or --new-chat
  let shouldStartNew = false;
  const newIndex = args.findIndex(arg => arg === '--new' || arg === '-n' || arg === '--new-chat');
  if (newIndex !== -1) {
    shouldStartNew = true;
    args.splice(newIndex, 1);
  }

  // Parse arguments to look for --continue or -c
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

  // DEFAULT BEHAVIOR: Automatically continue active conversation unless user requested a new chat or listing
  if (!shouldStartNew && !shouldContinue && !shouldList) {
    shouldContinue = true;
  }
  
  // Parse arguments to look for --deep or -d
  let isDeep = false;
  const deepIndex = args.findIndex(arg => arg === '--deep' || arg === '-d');
  if (deepIndex !== -1) {
    isDeep = true;
    args.splice(deepIndex, 1);
  }

  // Parse arguments to look for --image or -i
  let isImage = false;
  const imageIndex = args.findIndex(arg => arg === '--image' || arg === '-i');
  if (imageIndex !== -1) {
    isImage = true;
    args.splice(imageIndex, 1);
  }
  
  const prompt = args.join(' ');
  
  if (!shouldList && !prompt && !filePath) {
    console.log('Usage: node index.js [--new] [--continue <index_or_id>] [--file path/to/file] [--list] "your prompt here"');
    return;
  }
  
  let absoluteFilePath = null;
  if (filePath) {
    absoluteFilePath = path.resolve(filePath);
    if (!fs.existsSync(absoluteFilePath)) {
      console.error(`[ERROR] File not found: ${absoluteFilePath}`);
      process.exit(1);
    }
  }

  // 1. List conversations logic
  if (shouldList) {
    console.log(`Starting headless Chrome with profile: ${USER_DATA_DIR}`);
    // Ensure the directory exists
    if (!fs.existsSync(USER_DATA_DIR)) {
      fs.mkdirSync(USER_DATA_DIR, { recursive: true });
    }
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: true,
      channel: 'chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await context.newPage();
    try {
      console.log('Navigating directly to Spark tasks list...');
      await page.goto('https://gemini.google.com/spark/tasks', { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Check if we are redirected to the Google Login page
      if (page.url().includes('accounts.google.com')) {
        console.error('\n[ERROR] Oturum açılmamış! (Not logged in)');
        console.error('Lütfen önce giriş komutunu çalıştırarak giriş yapın.\n');
        await context.close();
        process.exit(1);
      }

      await page.waitForTimeout(4000);
      
      try {
        await page.waitForSelector('div.goal-card', { timeout: 15000 });
        console.log('Task cards loaded.');
      } catch (e) {
        console.log('No task cards loaded or timeout occurred.');
      }
      await page.waitForTimeout(2000);
      
      const chats = await page.evaluate(() => {
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
        console.log('Spark sohbet geçmişi bulunamadı.');
      } else {
        console.log('\n--- GEMINI SPARK SOHBETLERİ ---');
        chats.forEach((chat, idx) => {
          const scheduledLabel = chat.isScheduled ? ' ⏱️ [Zamanlanmış]' : '';
          console.log(`[${idx + 1}] ${chat.title} (ID: ${chat.id})${scheduledLabel}`);
        });
        console.log('-------------------------------\n');
        
        // Save to cache file for index mapping
        const cacheFile = path.resolve(__dirname, '../last-chat-list.json');
        fs.writeFileSync(cacheFile, JSON.stringify(chats, null, 2), 'utf8');
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      try {
        await context.close();
      } catch (e) {}
      process.exit(0);
    }
  }

  console.log(`Starting headless Chrome with profile: ${USER_DATA_DIR}`);
  
  // Ensure the directory exists
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    channel: 'chrome',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ],
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Navigating to Gemini...');
    let targetUrl = 'https://gemini.google.com/app';
    const lastChatFile = path.resolve(__dirname, '../last-chat-url.txt');
    const cacheFile = path.resolve(__dirname, '../last-chat-list.json');
    
    if (shouldStartNew && fs.existsSync(lastChatFile)) {
      try {
        fs.unlinkSync(lastChatFile);
        console.log('[INFO] Starting a new chat context as requested by --new flag.');
      } catch (e) {}
    }
    
    if (shouldContinue) {
      let chatId = null;
      
      if (continueTarget) {
        // Check if continueTarget is an index (number)
        const targetIndex = parseInt(continueTarget, 10);
        if (!isNaN(targetIndex) && fs.existsSync(cacheFile)) {
          const chats = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
          if (targetIndex >= 1 && targetIndex <= chats.length) {
            chatId = chats[targetIndex - 1].id;
            console.log(`Index ${targetIndex} resolved to Chat ID: ${chatId}`);
          } else {
            console.error(`[ERROR] Invalid index: ${targetIndex}. Available indices: 1 to ${chats.length}`);
            await context.close();
            process.exit(1);
          }
        } else {
          // It's a direct Chat ID (e.g. 11c9923185decc44)
          chatId = continueTarget;
        }
      } else if (fs.existsSync(lastChatFile)) {
        // Default to last saved chat URL
        const savedUrl = fs.readFileSync(lastChatFile, 'utf8').trim();
        if (savedUrl && savedUrl.startsWith('https://gemini.google.com/')) {
          targetUrl = savedUrl;
          console.log(`Continuing conversation from saved URL: ${targetUrl}`);
        }
      }
      
      if (continueTarget && chatId) {
        targetUrl = `https://gemini.google.com/app/${chatId}`;
        console.log(`Continuing conversation from: ${targetUrl}`);
      } else if (!targetUrl || targetUrl === 'https://gemini.google.com/app') {
        if (!fs.existsSync(lastChatFile) && !continueTarget) {
          console.log('No previous conversation found to continue. Starting a new chat.');
        }
      }
    }

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    if (shouldContinue && targetUrl !== 'https://gemini.google.com/app') {
      console.log('Waiting for previous conversation history to load...');
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
        console.log('Conversation history not loaded directly. Attempting to resolve active conversation from Gemini sidebar...');
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
            console.log(`[INFO] Continuing conversation from top recent chat: ${targetUrl}`);
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(3000);
          } else {
            console.log('[WARN] No previous chats found in sidebar.');
          }
        } catch (sidebarErr) {
          console.log('[WARN] Sidebar resolution failed:', sidebarErr.message);
        }
      }
    }
    
    // Check if we are redirected to the Google Login page
    const currentUrl = page.url();
    if (currentUrl.includes('accounts.google.com')) {
      console.error('\n[ERROR] Oturum açılmamış! (Not logged in)');
      console.error('Lütfen aşağıdaki komutu kendi bilgisayarınızın terminalinde (CMD veya PowerShell) çalıştırarak giriş yapın:\n');
      console.error(`  start chrome --remote-debugging-port=9222 --user-data-dir="${USER_DATA_DIR}"\n`);
      console.error('Açılan tarayıcıda Google hesabınızla giriş yapıp Gemini ekranına gelin, ardından tarayıcıyı kapatıp bu sorguyu tekrar çalıştırın.\n');
      await context.close();
      process.exit(1);
    }
    
    console.log('Gemini loaded. Finding input textbox...');
    const textboxSelector = '[role="textbox"], div[contenteditable="true"]';
    await page.waitForSelector(textboxSelector, { timeout: 15000 });
    const textbox = page.locator(textboxSelector).first();
    
    // Toggle Deep Research / Thinking Mode if --deep is requested
    if (isDeep) {
      console.log('Attempting to activate Deep Research mode...');
      try {
        const isAlreadyActive = await page.evaluate(() => {
          const btn = document.querySelector('button[aria-label*="Deselect Deep research" i], button[aria-label*="Deep research" i]');
          return btn ? (btn.getAttribute('aria-label') || '').toLowerCase().includes('deselect') : false;
        });

        if (isAlreadyActive) {
          console.log('[INFO] Deep Research mode is already active.');
        } else {
          // 1. Select Pro model first if needed
          const modelSwitcherSelector = 'button[data-test-id="bard-mode-menu-button"], button.input-area-switch';
          await page.waitForSelector(modelSwitcherSelector, { timeout: 8000 }).catch(() => null);

          const isProSelected = await page.evaluate(() => {
            const btn = document.querySelector('button[data-test-id="bard-mode-menu-button"], button.input-area-switch');
            if (!btn) return false;
            const text = (btn.innerText || '').toLowerCase();
            const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
            return text.includes('pro') || ariaLabel.includes('currently pro');
          });

          if (!isProSelected) {
            console.log('Selecting Pro model first...');
            const modelDropdown = page.locator('button:has-text("Flash-Lite"), button:has-text("Flash"), button:has-text("Pro"), button[aria-haspopup="true"]').first();
            if (await modelDropdown.count() > 0) {
              await modelDropdown.click();
              await page.waitForTimeout(1500);
              
              const proItem = page.locator('gem-menu-item:has-text("Pro"), [role="menuitem"]:has-text("Pro"), [role="option"]:has-text("Pro")').first();
              if (await proItem.count() > 0) {
                const isDisabled = await proItem.getAttribute('aria-disabled') === 'true';
                if (isDisabled) {
                  console.log('[WARN] Pro model option is disabled in the menu (requires Advanced subscription).');
                  // Press escape to close dropdown
                  await page.keyboard.press('Escape');
                  await page.waitForTimeout(1000);
                } else {
                  await proItem.click();
                  console.log('[OK] Pro model selected from dropdown.');
                  await page.waitForTimeout(4000);
                }
              }
            }
          }

          // 2. Open attach/tools menu to click Deep Research
          const attachButton = page.locator('button[aria-label*="Upload" i], button[aria-label*="Yükleme" i], button[aria-label*="Add" i]').first();
          if (await attachButton.count() > 0) {
            await attachButton.click();
            await page.waitForTimeout(2000);

            // Click "More tools" if visible
            const moreToolsButton = page.locator('button:has-text("More tools"), [role="menuitem"]:has-text("More tools"), li:has-text("More tools")').first();
            if (await moreToolsButton.count() > 0 && await moreToolsButton.isVisible()) {
              console.log('Opening More tools drawer...');
              await moreToolsButton.click();
              await page.waitForTimeout(1500);
            }

            // Click "Deep research" menu item
            const deepResearchItem = page.locator('button:has-text("Deep research"), [role="menuitem"]:has-text("Deep research"), li:has-text("Deep research")').first();
            if (await deepResearchItem.count() > 0 && await deepResearchItem.isVisible()) {
              console.log('Activating Deep Research mode...');
              await deepResearchItem.click();
              await page.waitForTimeout(4000);
              console.log('[OK] Deep Research mode successfully activated.');
            } else {
              console.log('[WARN] Deep Research option not found in tools menu.');
            }
          } else {
            console.log('[WARN] Attach button not found to open tools menu.');
          }
        }
      } catch (deepError) {
        console.log('[WARN] Could not toggle Deep Research:', deepError.message);
      }
    }
    
    // File Upload logic
    if (absoluteFilePath) {
      console.log(`Uploading file: ${absoluteFilePath}...`);
      
      try {
        // 1. Check if input[type="file"] already exists
        const fileInputSelector = 'input[type="file"]';
        const directInput = page.locator(fileInputSelector).first();
        const existsDirectly = await directInput.count() > 0;
        
        if (existsDirectly) {
          console.log('Found direct file input. Uploading...');
          await directInput.setInputFiles(absoluteFilePath);
        } else {
          console.log('Direct input not found. Clicking upload button to trigger input...');
          
          // Start waiting for filechooser event
          const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
          
          let uploadBtn = null;
          const filesButton = page.locator('button:has-text("Files"), button[aria-label*="File" i]').first();
          if (await filesButton.count() > 0 && await filesButton.isVisible()) {
            console.log('Deep Research files button is visible, clicking it...');
            uploadBtn = filesButton;
          } else {
            console.log('Using standard attach button...');
            uploadBtn = page.locator('button[aria-label*="Yükleme" i], button[aria-label*="Upload" i], button[aria-label*="Add" i]').first();
          }
          
          await uploadBtn.waitFor({ state: 'visible', timeout: 5000 });
          await uploadBtn.click();
          
          // Only click the submenu item if we used the standard attach button (since filesButton triggers filechooser directly)
          if (uploadBtn !== filesButton) {
            console.log('Upload button clicked, waiting for menu options to open...');
            await page.waitForTimeout(1000);
            try {
              const menuItem = page.locator('[role="menuitem"]').filter({ hasText: /Upload files|Bilgisayardan|Dosya/i }).first();
              await menuItem.waitFor({ state: 'visible', timeout: 3000 });
              await menuItem.click();
              console.log('Menu item clicked.');
            } catch (menuError) {
              console.log('No specific menu item clicked, checking if file chooser is active directly...');
            }
          }
          
          const fileChooser = await fileChooserPromise;
          if (fileChooser) {
            console.log('File chooser dialog intercepted. Uploading...');
            await fileChooser.setFiles(absoluteFilePath);
          } else {
            console.log('File chooser not intercepted. Waiting for input[type="file"] in DOM...');
            await page.waitForSelector(fileInputSelector, { timeout: 5000 });
            const fileInput = page.locator(fileInputSelector).first();
            await fileInput.setInputFiles(absoluteFilePath);
          }
        }
        
        console.log('File sent to browser. Waiting for upload/preview to load...');
        // Wait a few seconds for the file upload preview to appear in the UI
        await page.waitForTimeout(4000);
      } catch (uploadError) {
        console.error('[WARNING] Could not upload file via upload selectors. Proceeding with prompt anyway...', uploadError);
      }
    }
    
    if (prompt) {
      console.log('Typing prompt with realistic keystrokes...');
      await textbox.click();
      await page.keyboard.type(prompt, { delay: 5 });
      await page.waitForTimeout(1000);
    }
    
    // Capture initial counts of response elements
    const initialCounts = await page.evaluate(() => {
      const selectors = [
        'message-content',
        'shared-response-renderer',
        'inline-response-renderer',
        'model-response',
        '.model-response',
        'div[class*="model-response"]',
        'div[class*="response"]',
        'response-container',
        '.response-container'
      ];
      const counts = {};
      for (const selector of selectors) {
        counts[selector] = document.querySelectorAll(selector).length;
      }
      return counts;
    });
    console.log(`Initial response counts: ${JSON.stringify(initialCounts)}`);

    console.log('Sending message...');
    await page.keyboard.press('Enter');
    
    console.log('Waiting for response to generate...');
    
    // We check if the response text has stopped changing
    let lastResponseText = '';
    let stableCount = 0;
    let maxStableChecks = 8; // 4 seconds of consecutive no text changes
    let responseFound = false;
    let checkAttempts = 0;
    let maxAttempts = 120; // Max 60 seconds
    let checkInterval = 500; // 500ms default
    let hasClickedStartResearch = false;
    
    while (stableCount < maxStableChecks && checkAttempts < maxAttempts) {
      await page.waitForTimeout(checkInterval);
      checkAttempts++;
      
      const currentText = await page.evaluate((initCounts) => {
        const selectors = [
          'message-content',
          'shared-response-renderer',
          'inline-response-renderer',
          'model-response',
          '.model-response',
          'div[class*="model-response"]',
          'div[class*="response"]',
          'response-container',
          '.response-container'
        ];
        
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
          const modelHeaders = document.querySelectorAll('h2.screen-reader-model-response-label');
          if (modelHeaders.length > 0) {
            const lastHeader = modelHeaders[modelHeaders.length - 1];
            if (lastHeader.parentElement) {
              latestEl = lastHeader.parentElement;
            }
          }
        }
        
        if (!latestEl) {
          const allZero = Object.values(initCounts).every(v => v === 0);
          if (allZero) {
            const divs = Array.from(document.querySelectorAll('div'));
            const candidates = divs.filter(d => d.className && d.className.includes('response') && d.innerText && d.innerText.length > 10);
            if (candidates.length > 0) {
              latestEl = candidates[candidates.length - 1];
            }
          }
        }
        
        return latestEl ? latestEl.innerText : null;
      }, initialCounts);
      
      if (currentText && currentText.trim().length > 0) {
        responseFound = true;
        if (currentText === lastResponseText) {
          stableCount++;
        } else {
          stableCount = 0;
          lastResponseText = currentText;
        }
      }
      
      // Auto-detect and click "Start research" / "Araştırmayı başlat" button if present
      if (!hasClickedStartResearch) {
        const startResearchClicked = await page.evaluate(() => {
          const candidates = Array.from(document.querySelectorAll('button, [role="button"]'));
          const startBtn = candidates.find(btn => {
            const text = (btn.innerText || '').toLowerCase().trim();
            return text.includes('start research') || 
                   text.includes('araştırmayı başlat') || 
                   text.includes('araştırmaya başla') ||
                   text.includes('başlat') || 
                   text === 'başla';
          });
          
          if (startBtn) {
            const rect = startBtn.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              startBtn.click();
              return true;
            }
          }
          return false;
        });
        
        if (startResearchClicked) {
          console.log('[INFO] "Start research" / "Başla" button detected and clicked automatically. Switching to 5-second polling interval for deep research...');
          hasClickedStartResearch = true;
          stableCount = 0;
          responseFound = false;
          lastResponseText = '';
          
          // Switch to 5-second polling interval to balance responsiveness and stability
          checkInterval = 5000;  // 5 seconds
          maxAttempts = 120;     // 10 minutes total wait (120 attempts * 5s)
          maxStableChecks = 6;   // Stable if unchanged for 30 seconds (6 consecutive checks * 5s) to allow slow search steps
          checkAttempts = 0;     // Reset attempts
          await page.waitForTimeout(4000);
        }
      }
      
      const isStopButtonVisible = await page.evaluate(() => {
        const stopSelectors = [
          'button[aria-label*="Stop" i]',
          'button[aria-label*="Durdur" i]',
          'button[aria-label*="Cancel" i]',
          'button[aria-label*="İptal" i]',
          'mat-icon[fonticon="stop"]',
          'gem-icon[fonticonname="stop"]'
        ];
        for (const sel of stopSelectors) {
          const el = document.querySelector(sel);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) return true;
          }
        }
        return false;
      });
      
      if (!isStopButtonVisible && responseFound && stableCount >= maxStableChecks) {
        console.log('Generation completed (text is fully stable and Stop button is hidden).');
        break;
      }
    }
    
    if (!responseFound || lastResponseText.trim().length === 0) {
      console.error('[ERROR] Response could not be captured.');
    } else {
      console.log('\n--- GEMINI SPARK RESPONSE ---');
      console.log(lastResponseText.trim());
      console.log('-----------------------------\n');
      
      // Check for any Google Workspace links inside page evaluate
      let workspaceLinks = [];
      try {
        workspaceLinks = await page.evaluate((initCounts) => {
          const selectors = [
            'message-content',
            'shared-response-renderer',
            'inline-response-renderer',
            '.model-response',
            'div[class*="model-response"]',
            'div[class*="response"]'
          ];
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
            // Check fallback
            const divs = Array.from(document.querySelectorAll('div'));
            const candidates = divs.filter(d => d.className && d.className.includes('response') && d.innerText && d.innerText.length > 10);
            if (candidates.length > 0) {
              latestEl = candidates[candidates.length - 1];
            }
          }
          if (!latestEl) return [];
          
          const anchors = Array.from(latestEl.querySelectorAll('a'));
          return anchors
            .map(a => a.getAttribute('href') || '')
            .filter(href => href.includes('docs.google.com/'));
        }, initialCounts);
      } catch (err) {
        console.log('[WARN] Error fetching link tags:', err.message);
      }
      
      // Fallback: search raw response text for any Google Workspace URLs if no links were parsed
      if (workspaceLinks.length === 0) {
        const textLinks = lastResponseText.match(/https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/g) || [];
        workspaceLinks = Array.from(new Set(textLinks));
      }
      
      // Process each found Google Workspace link
      for (const link of workspaceLinks) {
        let exportUrl = null;
        let filename = null;
        let fileType = null;
        
        const docMatch = link.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
        const sheetMatch = link.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
        const presentationMatch = link.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
        
        if (docMatch) {
          const docId = docMatch[1];
          fileType = 'Google Doc';
          exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
          filename = `downloaded-doc-${docId}.txt`;
        } else if (sheetMatch) {
          const sheetId = sheetMatch[1];
          fileType = 'Google Sheet';
          exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
          filename = `downloaded-sheet-${sheetId}.xlsx`;
        } else if (presentationMatch) {
          const slidesId = presentationMatch[1];
          fileType = 'Google Slides';
          exportUrl = `https://docs.google.com/presentation/d/${slidesId}/export/pptx`;
          filename = `downloaded-slides-${slidesId}.pptx`;
        }
        
        if (exportUrl && filename) {
          console.log(`[INFO] ${fileType} link detected: ${link}`);
          console.log(`[INFO] Exporting and downloading content to ${filename}...`);
          try {
            const downloadPage = await context.newPage();
            const downloadPromise = downloadPage.waitForEvent('download', { timeout: 15000 });
            
            await downloadPage.goto(exportUrl).catch(() => {});
            
            const download = await downloadPromise;
            const downloadPath = path.resolve(__dirname, `../${filename}`);
            await download.saveAs(downloadPath);
            console.log(`[OK] ${fileType} content downloaded locally: ${downloadPath}`);
            
            // Copy to the active working directory
            const currentWorkingDir = process.cwd();
            const destPath = path.resolve(currentWorkingDir, filename);
            fs.copyFileSync(downloadPath, destPath);
            console.log(`[OK] Copied ${fileType} to active directory: ${destPath}`);
            
            await downloadPage.close();
          } catch (downloadErr) {
            console.error(`[WARNING] Could not export ${fileType}:`, downloadErr.message);
          }
        }
      }
      
      // Image download logic for the latest response
      let imageBlobs = [];
      try {
        imageBlobs = await page.evaluate((initCounts) => {
          const selectors = [
            'message-content',
            'shared-response-renderer',
            'inline-response-renderer',
            '.model-response',
            'div[class*="model-response"]',
            'div[class*="response"]'
          ];
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
        console.log('[WARN] Error finding image blobs:', err.message);
      }

      if (imageBlobs.length > 0) {
        console.log(`[INFO] Found ${imageBlobs.length} generated image(s) in response. Downloading...`);
        for (let i = 0; i < imageBlobs.length; i++) {
          const blobUrl = imageBlobs[i];
          try {
            console.log(`[INFO] Downloading image ${i + 1}/${imageBlobs.length}...`);
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
            console.log(`[OK] Image downloaded locally: ${localPath}`);
            
            const currentWorkingDir = process.cwd();
            const destPath = path.resolve(currentWorkingDir, filename);
            fs.copyFileSync(localPath, destPath);
            console.log(`[OK] Copied image to active directory: ${destPath}`);
          } catch (imgErr) {
            console.error(`[WARNING] Could not download image ${i + 1}:`, imgErr.message);
          }
        }
      }
      
      // Wait for session synchronization and URL update
      console.log('Saving conversation state and syncing with Google servers...');
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
        console.log(`[INFO] Conversation saved: ${finalUrl}`);
      }
    }
  } catch (error) {
    console.error('An error occurred during execution:', error);
  } finally {
    try {
      if (page) await page.close().catch(() => {});
      console.log('Flushing session data to disk...');
      await new Promise(resolve => setTimeout(resolve, 4000));
      if (context) await context.close().catch(() => {});
    } catch (e) {}
    process.exit(0);
  }
}

run().catch(console.error);
