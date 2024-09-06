// versionInfo.js
export const versionHistory = [
  {
    version: "1.1.1",
    date: "2024-09-06",
    changes: [
      "Changing Loading Icons",
      "Fixed visual display of messengerns on home page",
      "Fixed long descriptions of messengers not displaying correctly",
    ]
  },
  {
    version: "1.1.0",
    date: "2024-08-30",
    changes: [
      "Updating about page",
      "Lots of UI updates",
      "Fixing display on mobile devices"
    ]
  },
  {
    version: "1.0.7",
    date: "2024-08-27",
    changes: [
      "Added About page",
      "Small visual changes..."
    ]
  },
  {
    version: "1.0.6",
    date: "2024-08-23",
    changes: [
      "Small visual changes",
      "Fixing some network requests duplicating",
      "Updating site descriptions",
      "Fixed websocket bug crashing server"
    ]
  },
  {
    version: "1.0.5",
    date: "2024-08-13",
    changes: [
      "Rework websockets, one per connected client",
      "New logos",
      "Adding connected users for messengers",
      "Updates to login page"
    ]
  },
  {
    version: "1.0.4",
    date: "2024-08-02",
    changes: [
      "Live chat updates now work for users that are logged in",
      "UI changes to messengers",
      "Fixed how messages are stored in database",
      "Fixed bug with changing username",
      "Fixed clients being unsynced in messengers"
    ]
  },
  {
    version: "1.0.3",
    date: "2024-08-01",
    changes: [
      "Fixing 404 error on frontend host",
      "Site added on Google Search Console",
      "Adding webhooks to backend"
    ]
  },
  {
    version: "1.0.2",
    date: "2024-07-31",
    changes: [
      "Added menu button (bottom left)",
      "Updated Changelog page",
      "New domain -> webpigeon.net",
      "Added user UUID",
      "Updating databases..."
    ]
  },
  {
    version: "1.0.1",
    date: "2024-07-30",
    changes: [
      "Fixed bug in user authentication",
      "Improved message loading performance",
      "Added circular profile pictures",
      "Updated Icons",
      "Fixed input box rendering"
    ] 
  },
  {
    version: "1.0.0",
    date: "2024-07-15",
    changes: [
      "Initial release of Web Pigeon",
      "very exciting!"
    ]
  }
];
  
export const getLatestVersion = () => {
  return versionHistory[0].version;
};