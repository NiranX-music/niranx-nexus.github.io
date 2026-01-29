// NiranX StudyVerse - Background Service Worker

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('NiranX StudyVerse extension installed!');
    
    // Set default storage values
    chrome.storage.local.set({
      installed: true,
      installDate: new Date().toISOString(),
      settings: {
        notifications: true,
        focusReminders: true,
        dailyGoal: 120 // minutes
      }
    });
  }
});

// Handle alarms for study reminders
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'studyReminder') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'pwa-192x192.png',
      title: 'NiranX Study Reminder',
      message: 'Time to focus! Open a new tab to start your study session.',
      priority: 2
    });
  }
  
  if (alarm.name === 'breakReminder') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'pwa-192x192.png',
      title: 'Take a Break!',
      message: 'You\'ve been studying for a while. Time for a short break!',
      priority: 1
    });
  }
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_STUDY_REMINDER') {
    chrome.alarms.create('studyReminder', {
      delayInMinutes: message.delayMinutes || 60,
      periodInMinutes: message.periodMinutes || 60
    });
    sendResponse({ success: true });
  }
  
  if (message.type === 'SET_BREAK_REMINDER') {
    chrome.alarms.create('breakReminder', {
      delayInMinutes: message.delayMinutes || 25
    });
    sendResponse({ success: true });
  }
  
  if (message.type === 'CLEAR_ALARMS') {
    chrome.alarms.clearAll();
    sendResponse({ success: true });
  }
  
  if (message.type === 'GET_STATS') {
    chrome.storage.local.get(['studyStats'], (result) => {
      sendResponse({ stats: result.studyStats || {} });
    });
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'UPDATE_STATS') {
    chrome.storage.local.get(['studyStats'], (result) => {
      const stats = result.studyStats || {
        totalMinutes: 0,
        sessionsCompleted: 0,
        currentStreak: 0,
        lastStudyDate: null
      };
      
      const updatedStats = { ...stats, ...message.stats };
      chrome.storage.local.set({ studyStats: updatedStats });
      sendResponse({ success: true, stats: updatedStats });
    });
    return true;
  }
  
  return false;
});

// Track when new tab is opened
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.pendingUrl === 'chrome://newtab/' || tab.url === 'chrome://newtab/') {
    chrome.storage.local.get(['openCount'], (result) => {
      const count = (result.openCount || 0) + 1;
      chrome.storage.local.set({ openCount: count });
    });
  }
});
