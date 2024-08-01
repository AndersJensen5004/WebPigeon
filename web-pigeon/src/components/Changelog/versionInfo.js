// versionInfo.js
export const versionHistory = [
    {
      version: "1.0.3",
      date: "2024-07-31",
      changes: [
        "Fixing 404 error on frontend host",
        "Site added on Google Search Console",
        ""
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