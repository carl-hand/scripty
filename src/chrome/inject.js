/*global chrome*/
let selectedElements = [];
let fallback;
let priorityQueue;

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
    console.log(`selectedElements: ${JSON.stringify(selectedElements)}`);
    console.log(`vals ${event?.target.value}`);
  });
}

function findSelectedElement(target, eventType) {
  priorityQueue.clear();
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
  const { attributes = {}, defaultValue } = target;
  const hasNoAttributes = !target.hasAttributes();
  const onlyHasClassAtttribute =
    Object.keys(attributes).length === 1 && attributes[0].name === 'class';
  const hasChildren = target.children?.length > 0;
  if (hasNoAttributes || (onlyHasClassAtttribute && hasChildren)) {
    const entry = attributes[0];
    const { name, value } = entry;
    // set parent fallback
    fallback = {
      type: eventType,
      name,
      value,
      input: defaultValue,
    };
    return findElement(target.children[0], eventType);
  } else if (onlyHasClassAtttribute) {
    // for elements that only have class attribute and no children
    const entry = attributes[0];
    const { name, value } = entry;
    return {
      type: eventType,
      name,
      value,
      input: defaultValue,
    };
  }

  // if we get this far then we have an element with multiple attributes
  for (const key in attributes) {
    const entry = attributes[key];
    const { name, value } = entry;
    if (name && value) {
      priorityQueue.insert({
        type: eventType,
        name,
        value,
        input: defaultValue,
      });
    }
  }

  if (!priorityQueue.isEmpty()) {
    // return highest priority attribute
    return priorityQueue.getAttribute();
  }

  if (fallback) {
    return fallback;
  }

  // else return element not found
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

(async () => {
  const src = chrome.runtime.getURL('priorityQueue.js');
  const { PriorityQueue } = await import(src);
  priorityQueue = new PriorityQueue();
})();

addListenersToBackgroundPage();
