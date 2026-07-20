import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_DATA_DIR = path.resolve(__dirname, '../chrome-profile');

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
  
  // Parse arguments to look for --deep or -d
  let isDeep = false;
  const deepIndex = args.findIndex(arg => arg === '--deep' || arg === '-d');
  if (deepIndex !== -1) {
    isDeep = true;
    args.splice(deepIndex, 1);
  }
  
  const prompt = args.join(' ');
  
  if (!shouldList && !prompt && !filePath) {
    console.log('Usage: node index.js [--file path/to/file] [--continue <index_or_id>] [--deep] [--list] "your prompt here"');
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
      console.log('Navigating to Gemini to fetch chat list...');
      await page.goto('https://gemini.google.com/app', { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Check if we are redirected to the Google Login page
      if (page.url().includes('accounts.google.com')) {
        console.error('\n[ERROR] Oturum açılmamış! (Not logged in)');
        console.error('Lütfen önce giriş komutunu çalıştırarak giriş yapın.\n');
        await context.close();
        process.exit(1);
      }

      await page.waitForTimeout(4000);
      
      // Toggle sidebar open if closed
      const sidebarButton = page.locator('button[aria-label*="Kenar" i], button[aria-label*="Menu" i], button[aria-label*="sidebar" i]').first();
      if (await sidebarButton.count() > 0 && await sidebarButton.isVisible()) {
        await sidebarButton.click();
        await page.waitForTimeout(1000);
      }
      
      const chats = await page.evaluate(() => {
        const aTags = Array.from(document.querySelectorAll('a'));
        return aTags
          .map(a => {
            const href = a.getAttribute('href') || '';
            const match = href.match(/\/app\/([a-f0-9]+)$/);
            return {
              id: match ? match[1] : null,
              title: (a.innerText || '').trim() || a.getAttribute('aria-label') || 'Sohbet'
            };
          })
          .filter(c => c.id);
      });
      
      if (chats.length === 0) {
        console.log('Sohbet geçmişi bulunamadı.');
      } else {
        console.log('\n--- GEMINI SPARK SOHBETLERİ ---');
        chats.forEach((chat, idx) => {
          console.log(`[${idx + 1}] ${chat.title} (ID: ${chat.id})`);
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
        const match = savedUrl.match(/\/app\/([a-f0-9]+)$/);
        if (match) {
          chatId = match[1];
        }
      }
      
      if (chatId) {
        targetUrl = `https://gemini.google.com/app/${chatId}`;
        console.log(`Continuing conversation from: ${targetUrl}`);
      } else {
        console.log('No previous conversation found to continue. Starting a new chat.');
      }
    }
    
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Check if we are starting a new chat, and if the "Spark" tab is available, switch to it!
    if (targetUrl === 'https://gemini.google.com/app') {
      console.log('Checking for Spark tab...');
      try {
        const sparkTab = page.locator('button, [role="tab"], .app-tab').filter({ hasText: /Spark/i }).first();
        // Wait up to 5 seconds for the tab to appear
        await sparkTab.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
        if (await sparkTab.count() > 0 && await sparkTab.isVisible()) {
          console.log('Switching to Spark tab...');
          await sparkTab.click();
          await page.waitForTimeout(2000);
        } else {
          console.log('Spark tab not found or not visible, using default tab.');
        }
      } catch (tabError) {
        console.log('[WARN] Could not switch to Spark tab:', tabError.message);
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
          
          // Click the attach button: "Yükleme ve araçlar" / "Upload and tools" / plus icon
          const attachButton = page.locator('button[aria-label*="Yükleme" i], button[aria-label*="Upload" i], button[aria-label*="Add" i]').first();
          await attachButton.waitFor({ state: 'visible', timeout: 5000 });
          await attachButton.click();
          console.log('Upload button clicked, waiting for menu options to open...');
          
          await page.waitForTimeout(1000);
          
          try {
            // Find and click the menu item for computer upload (Upload files / Bilgisayardan yükle)
            // Using [role="menuitem"] specifically to avoid matching outer container divs
            const menuItem = page.locator('[role="menuitem"]').filter({ hasText: /Upload files|Bilgisayardan|Dosya/i }).first();
            await menuItem.waitFor({ state: 'visible', timeout: 3000 });
            await menuItem.click();
            console.log('Menu item clicked.');
          } catch (menuError) {
            console.log('No specific menu item clicked, checking if file chooser is active directly...');
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
    
    // Toggle Deep Research / Thinking Mode if --deep is requested
    if (isDeep) {
      console.log('Attempting to activate Deep Research / Thinking mode...');
      try {
        const deepToggle = page.locator('button[aria-label*="Deep Research" i], button[aria-label*="Derin Araştırma" i], button[aria-label*="Thinking" i], [role="button"]:has-text("Deep Research"), [role="button"]:has-text("Thinking")').first();
        if (await deepToggle.count() > 0 && await deepToggle.isVisible()) {
          const isChecked = await deepToggle.getAttribute('aria-checked') === 'true' || 
                            await deepToggle.getAttribute('aria-pressed') === 'true' ||
                            (await deepToggle.getAttribute('class') || '').includes('checked');
          if (!isChecked) {
            await deepToggle.click();
            console.log('[OK] Deep Research / Thinking mode activated.');
            await page.waitForTimeout(2000);
          } else {
            console.log('[INFO] Deep Research / Thinking mode is already active.');
          }
        } else {
          console.log('[WARN] Deep Research / Thinking toggle button not found on this page.');
        }
      } catch (deepError) {
        console.log('[WARN] Could not toggle Deep Research:', deepError.message);
      }
    }
    
    if (prompt) {
      console.log('Typing prompt...');
      await textbox.focus();
      await textbox.fill(prompt);
      await page.waitForTimeout(1000);
    }
    
    // Detect initial number of response elements for all candidate selectors before sending the new message
    const initialCounts = await page.evaluate(() => {
      const selectors = [
        'message-content',
        'shared-response-renderer',
        'inline-response-renderer',
        '.model-response',
        'div[class*="model-response"]',
        'div[class*="response"]'
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
    
    // We check every 500ms if the response text has stopped changing
    let lastResponseText = '';
    let stableCount = 0;
    const maxStableChecks = 6; // 3 seconds of no changes
    let responseFound = false;
    let checkAttempts = 0;
    const maxAttempts = 120; // Max 60 seconds
    
    while (stableCount < maxStableChecks && checkAttempts < maxAttempts) {
      await page.waitForTimeout(500);
      checkAttempts++;
      
      const currentText = await page.evaluate((initCounts) => {
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
      
      const isStopButtonVisible = await page.evaluate(() => {
        const stopBtn = document.querySelector('button[aria-label*="Stop" i], button[aria-label*="Durdur" i]');
        if (!stopBtn) return false;
        const rect = stopBtn.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      
      if (!isStopButtonVisible && responseFound && stableCount >= 2) {
        console.log('Generation stopped (Stop button is hidden).');
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
      
      // Wait for session synchronization and URL update
      console.log('Saving conversation state...');
      await page.waitForTimeout(5000);
      const finalUrl = page.url();
      if (finalUrl.startsWith('https://gemini.google.com/app/') && finalUrl !== 'https://gemini.google.com/app') {
        const lastChatFile = path.resolve(__dirname, '../last-chat-url.txt');
        fs.writeFileSync(lastChatFile, finalUrl, 'utf8');
        console.log(`[INFO] Conversation saved: ${finalUrl}`);
      }
    }
    
  } catch (error) {
    console.error('An error occurred during execution:', error);
  } finally {
    try {
      await context.close();
    } catch (e) {}
    process.exit(0);
  }
}

run().catch(console.error);
