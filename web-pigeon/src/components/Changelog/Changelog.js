import React from 'react';
import './Changelog.css';

const Changelog = () => {
  const changes = [
    {
      version: "1.0.1",
      date: "2024-07-30",
      changes: [
        "Fixed bug in user authentication",
        "Improved message loading performance",
        "Added circular profile pictures",
        "Updating icons...",
        "Fixed input box rendering"
      ]
    },
    {
      version: "1.0.0",
      date: "2024-07-28",
      changes: [
        "Initial release of Web Pigeon",
        "very exciting..."
      ]
    }
  ];

  return (
    <div className="changelog terminal-interface">
      <h1>Changelog</h1>
      {changes.map((release, index) => (
        <div key={index} className="release">
          <h2>Version {release.version} <span className="date">({release.date})</span></h2>
          <ul>
            {release.changes.map((change, changeIndex) => (
              <li key={changeIndex}>{change}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Changelog;