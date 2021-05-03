/*global chrome*/
import './App.css';
import { useEffect, useRef, useState } from 'react';
import { createScript } from './utils/scriptUtil';
import { insertCSS, executeScript, query, sendMessage } from './chrome/api';

function App() {
  const [url, setUrl] = useState('');
  const [logData, setLogData] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [script, setScript] = useState('');
  const [copySuccessMsg, setCopySuccessMsg] = useState('');
  const selectedTabRef = useRef();
  const textAreaRef = useRef();
  const selectedElementsRef = useRef([]);

  const cacheSelectedElements = (selectedElements) => {
    selectedElementsRef.current = selectedElements;
  };

  useEffect(() => {
    function handleMessage(request, sender, sendResponse) {
      console.log(
        'Message from the content script: ' + JSON.stringify(request)
      );
      selectedElementsRef.current = [
        ...selectedElementsRef.current,
        ...request.selectedElements,
      ];
      sendResponse({ response: 'Response from background script' });
    }

    chrome.runtime.onMessage.addListener(handleMessage);
  }, []);

  const copyToClipboard = () => {
    if (textAreaRef.current) {
      textAreaRef.current.select();
      document.execCommand('copy');
    }
  };

  const generateScript = (selectedElements = []) => {
    const actualSelectedElements = [
      ...selectedElementsRef.current,
      ...selectedElements,
    ];
    setScript(createScript(url, actualSelectedElements));
  };

  const handleClick = async (evt) => {
    console.log(`url: ${url}`);
    if (!url) {
      setErrorMsg('Please enter a url');
      return;
    }

    const { target } = evt;
    const { name } = target;

    if (name === 'start') {
      try {
        const activeTabs = await query({ active: true });
        const selectedTabsArray = activeTabs?.filter((tab) => {
          return tab.url === url;
        });

        const noActiveTabWithUrl = selectedTabsArray?.length <= 0;
        if (noActiveTabWithUrl) {
          setErrorMsg(`No active tab found with url: ${url}`);
          return;
        }

        selectedTabRef.current = selectedTabsArray[0];
        const { id, url: matchingUrl } = selectedTabsArray[0];
        console.log(`tabs id1: ${id}`);
        console.log(`tabs url1: ${matchingUrl}`);

        insertCSS(id, ['index.css']);
        executeScript(id, ['inject.js']);
        setErrorMsg('');
      } catch (err) {
        setErrorMsg('Oops something went wrong...');
      }
    } else if (name === 'stop') {
      if (selectedTabRef.current) {
        sendMessage(
          selectedTabRef.current.id,
          { type: 'getSelectedElements' },
          generateScript
        );
      }
    } else if (name === 'copy') {
      if (script) {
        copyToClipboard();
        setCopySuccessMsg('Script copied to clipboard');
      }
    }
  };

  const handleChange = (evt) => {
    const { target } = evt;
    const { name, value, checked } = target;
    if (name === 'url') {
      setUrl(value);
    } else if (name === 'logData') {
      setLogData(checked);
      sendMessage(selectedTabRef.current.id, { type: 'logData' }, () => {});
    }
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
          name="url"
          placeholder="Enter Url to test"
          value={url}
          onChange={handleChange}
        />
        <div>
          <button name="start" onClick={handleClick}>
            Start
          </button>
          <button name="stop" onClick={handleClick}>
            Stop
          </button>
        </div>
        <div>
          <label htmlFor="log">Log Data</label>
          <input
            id="log"
            name="logData"
            type="checkbox"
            value={logData}
            onChange={handleChange}
          />
        </div>
        {errorMsg && <p>{errorMsg}</p>}

        <button name="copy" onClick={handleClick}>
          Copy to Clipboard
        </button>
        <label>{copySuccessMsg}</label>
        <textarea ref={textAreaRef} id="txtArea" readOnly value={script} />
      </header>
    </div>
  );
}

export default App;
