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
      return findClickedElement(target);
    case 'change':
      return findChangeElement(target);
    default:
      return { type: 'not supported' };
  }
}

function findClickedElement(target) {
  if (target.hasAttributes()) {
    const { attributes = {} } = target;
    let fallback;
    for (const key in attributes) {
      const entry = attributes[key];
      const { name, value } = entry;
      if (name && value) {
        // pick class as a last resort as this value could be brittle
        if (name === 'class') {
          fallback = {
            type: 'click',
            name,
            value,
          };
        } else {
          // stop once we find first name value pair other than class
          return {
            type: 'click',
            name,
            value,
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

function findChangeElement(target) {
  const { name, value } = target;
  if (name && value) {
    return {
      type: 'change',
      name,
      value,
    };
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
