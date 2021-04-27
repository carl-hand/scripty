/*global chrome*/
let selectedElements = [];

function addListenersToBackgroundPage() {
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
    const { target } = event;
    const selectedElement = findSelectedElement(target, 'click');
    selectedElements = [...selectedElements, selectedElement];
    console.log(`selectedElements: ${JSON.stringify(selectedElements)}`);
  });

  document.addEventListener('change', (event) => {
    const { target } = event;
    const selectedElement = findSelectedElement(target, 'change');
    selectedElements = [...selectedElements, selectedElement];
    console.log(`vals ${event?.target.value}`);
  });
}

function findSelectedElement(target, eventType) {
  switch (eventType) {
    case 'click':
      return findElement(target, 'click');
    case 'change':
      return findElement(target, 'change');
    default:
      return { type: 'not supported' };
  }
}

function findElement(target, eventType) {
  if (target.hasAttributes()) {
    const { attributes = {}, defaultValue } = target;
    let fallback;
    for (const key in attributes) {
      const entry = attributes[key];
      const { name, value } = entry;
      if (name && value) {
        // pick class as a last resort as this value could be brittle
        if (name === 'class') {
          fallback = {
            type: eventType,
            name,
            value,
            input: defaultValue,
          };
        } else {
          // stop once we find first name value pair other than class
          return {
            type: eventType,
            name,
            value,
            input: defaultValue,
          };
        }
      }
    }

    // use 'class' property if it exists and we found nothing else
    if (fallback) {
      return fallback;
    }
  }

  return getElementNotFound(target);
}

function getElementNotFound(target) {
  return {
    type: 'no match',
    value: target.innerHTML,
  };
}

function getSelectedElements() {
  return selectedElements;
}

function addEntry(entry) {
  selectedElements = [...selectedElements, entry];
}

(async () => {
  const src = chrome.runtime.getURL('api.js');
  const contentScript = await import(src);
  contentScript.addMessageListener(getSelectedElements, addEntry);
})();

addListenersToBackgroundPage();
