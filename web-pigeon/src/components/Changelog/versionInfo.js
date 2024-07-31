// versionInfo.js
export const versionHistory = [
    {
      version: "1.0.1",
      date: "2024-07-30",
      changes: [
        "Fixed bug in user authentication",
        "Improved message loading performance",
        "Added circular profile pictures"
      ]
    },
    {
      version: "1.0.0",
      date: "2024-07-15",
      changes: [
        "Initial release of Web Pigeon",
        "Implemented basic messaging functionality",
        "Created user profiles"
      ]
    }
  ];
  
  export const getLatestVersion = () => {
    return versionHistory[0].version;
  };