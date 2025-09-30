import React from 'react';
import { FaGithub } from 'react-icons/fa';

const GitHubSyncBanner = ({ showBanner, syncing, onSyncSkills }) => {
  if (!showBanner) {
    return null; // Don't show when showBanner is false
  }

  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FaGithub className="text-green-400 mr-3" />
          <div>
            <h4 className="text-green-800 font-semibold">Sync Your Latest Skills!</h4>
            <p className="text-green-700 text-sm">
              Update your skills from your latest GitHub repositories to get better recommendations.
            </p>
          </div>
        </div>
        <button 
          onClick={onSyncSkills}
          disabled={syncing}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300 flex items-center gap-2"
        >
          {syncing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          {syncing ? 'Syncing...' : 'Sync Skills'}
        </button>
      </div>
    </div>
  );
};

export default GitHubSyncBanner;