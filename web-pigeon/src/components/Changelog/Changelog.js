import React from 'react';
import { versionHistory } from './versionInfo.js';
import './Changelog.css';

const Changelog = () => {
  return (
    <div className="changelog terminal-interface">
      <h1>Changelog</h1>
      {versionHistory.map((release, index) => (
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