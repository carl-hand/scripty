/*global chrome*/
import './App.css';
import { useRef, useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const selectedTabRef = useRef();

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

      selectedTabRef.current = selectedTabsArray?.[0];

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
        files: ['inject.js'],
      });
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Oops something went wrong...');
    }
  };

  setInterval(() => {
    // chrome.tabs.query({ active: true }, function (tabs) {
    if (!url) {
      return;
    }

    if (selectedTabRef.current) {
      chrome.tabs.sendMessage(
        selectedTabRef.current.id,
        { type: 'getSelectedElements' },
        function (selectedElements) {
          console.log(`selectedElements: ${JSON.stringify(selectedElements)}`);
          console.log(`length: ${Object.keys(selectedElements).length}`);
        }
      );
    }
    // });
  }, 1000);

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
