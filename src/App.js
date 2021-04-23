/*global chrome*/
import './App.css';
import { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  function addListeners() {
    let box = document.getElementById('myBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'myBox';
      box.style.display = 'none';
      document.body.appendChild(box);
    }
    document.addEventListener('mouseover', (event) => {
      const { target = {} } = event;
      const { ariaLabel, id, name, title } = target;
      const { width, height, left, top } = target.getBoundingClientRect();

      // console.log(`left: ${left} - top: ${top}`);
      // console.log(`width: ${width} - height: ${height}`);
      // console.log(`target: ${ariaLabel}-${id}-${name}-${title}`);

      const actualTop = top + window.scrollY;
      const actualLeft = left + window.scrollX;

      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
      box.style.left = `${actualLeft}px`;
      box.style.top = `${actualTop}px`;
      box.style.display = 'block';
      box.classList.add('box');
    });

    document.addEventListener('mouseout', (event) => {
      if (box) {
        box.style.display = 'none';
      }
    });

    document.addEventListener('click', (event) => {
      event.stopPropagation();
      const { target } = event;
      const { ariaLabel, id, name, title, attributes = {} } = target;

      const attributesMap = Object.keys(attributes)
        .map((key) => {
          const object = attributes[key];
          const { name, value } = object;
          return { name, value };
        })
        .filter((obj) => Object.keys(obj).length > 0);

      // 1. pass element info back to chrome extension
      console.log(`attributesMap: ${JSON.stringify(attributesMap)}`);
      // 2. process this info and add line to output script
    });
  }

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
        function: addListeners,
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
