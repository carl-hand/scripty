/*global chrome*/
import './App.css';
import { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleClick = async () => {
    console.log(`url: ${url}`);

    if (!url) {
      setErrorMsg('Please enter a url');
      return;
    }

    try {
      let activeTabs = await chrome.tabs.query({ active: true });
      const selectedTabsArray = activeTabs.filter((tab) => {
        return tab.url === url;
      });

      const noActiveTabWithUrl = selectedTabsArray?.length <= 0;
      if (noActiveTabWithUrl) {
        setErrorMsg(`No active tab found with url: ${url}`);
        return;
      }

      const { id, url: matchingUrl } = selectedTabsArray[0];
      console.log(`tabs id1: ${id}`);
      console.log(`tabs url1: ${matchingUrl}`);
      
      chrome.scripting.insertCSS({
        target: { tabId: id },
        files: ['index.css'],
      });

      chrome.scripting.executeScript({
        target: { tabId: id },
        files: ['inject.js']
      });
    } catch (err) {
      setErrorMsg('Oops something went wrong...');
    }
  };

  const handleChange = (evt) => {
    const { target } = evt;
    setUrl(target?.value);
  };

  return (
    <div id="rootApp" className="App">
      <header
        id="header"
        aria-label="headerLabel"
        title="headerTitle"
        name="headerName"
        className="App-header"
      >
        <input
          placeholder="Enter Url to test"
          value={url}
          onChange={handleChange}
        />
        <button onClick={handleClick}>Start</button>
        {errorMsg && <p>{errorMsg}</p>}
      </header>
    </div>
  );
}

export default App;
