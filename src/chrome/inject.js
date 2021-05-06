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
    const { width, height, left, top } = target.getBoundingClientRect();

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
    // how do I not fire this off after the keydown event when the user hits enter for the keydown event?
    const { target } = event;
    const selectedElement = findSelectedElement(target, 'change');
    selectedElements = [...selectedElements, selectedElement];
    console.log(`selectedElements: ${JSON.stringify(selectedElements)}`);
  });

  document.addEventListener('keydown', (event) => {
    const { code, target } = event;
    if (code === 'Enter') {
      const selectedElement = findSelectedElement(target, 'change');
      selectedElements = [...selectedElements, selectedElement];
      if (target.form) {
        // for form cases we will access the form through the selectedElement, e.g. input element,
        // this proved to be more stable
        const selectedFormElement = { ...selectedElement, type: 'form' };
        selectedElements = [...selectedElements, selectedFormElement];
      } else {
        console.log(`no parent form element found....`);
      }
    }
  });

  window.addEventListener('beforeunload', function (event) {
    if (selectedElements.length) {
      chrome.runtime.sendMessage(
        { type: 'beforeunload', payload: selectedElements },
        (response) => {}
      );
    }
  });
}

function findSelectedElement(target, eventType) {
  priorityQueue.clear();
  switch (eventType) {
    case 'click':
      const element = findElement(target, 'click');
      // in some cases the element returned won't have a click event in its prototype chain,
      // for example SVG elements. In this scenario, walk back up the tree to find the first
      // parent HTML element we can fire a click event off on
      if (!(element?.target instanceof HTMLElement)) {
        const parentElement = findParentHtmlElement(element.target);
        return parentElement != null
          ? parentElement
          : getElementNotFound(target);
      }
      return element;
    case 'change':
      return findElement(target, 'change');
    default:
      return { type: 'not supported' };
  }
}

function findElement(target, eventType) {
  const { attributes = {} } = target;
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
      input: target.value,
      target,
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
      input: target.value,
      target,
    };
  }

  // if we get this far then we have an element with multiple attributes
  const highestPriorityAttribute = findHighestPriorityAttribute(
    attributes,
    eventType,
    target,
    false
  );

  if (highestPriorityAttribute) {
    return highestPriorityAttribute;
  }

  if (fallback) {
    return fallback;
  }

  // else return element not found
  return getElementNotFound(target);
}

function findHighestPriorityAttribute(
  attributes,
  eventType,
  target,
  shouldReset
) {
  if (shouldReset) {
    priorityQueue.clear();
  }

  for (let index = 0; index < attributes.length; index++) {
    const entry = attributes[index];
    const { name, value } = entry;
    if (name && value) {
      priorityQueue.insert({
        type: eventType,
        name,
        value,
        input: target.value,
        target,
      });
    }
  }

  // return highest priority attribute
  return priorityQueue.getAttribute();
}

function getElementNotFound(target) {
  return {
    type: 'no match',
    value: target.innerHTML,
  };
}

function findParentHtmlElement(childElement) {
  if (!childElement) {
    return null;
  }

  const parentEl = childElement.parentElement;
  if (parentEl instanceof HTMLElement) {
    const { attributes } = parentEl;
    return findHighestPriorityAttribute(attributes, 'click', parentEl, true);
  }

  return findParentHtmlElement(parentEl);
}

(async () => {
  const src = chrome.runtime.getURL('api.js');
  const contentScript = await import(src);

  const handleMessage = (message, sender, sendResponse) => {
    switch (message.type) {
      case 'start':
        addListenersToBackgroundPage();
        sendResponse();
        break;
      case 'getSelectedElements':
        sendResponse(selectedElements);
        break;
      case 'logData':
        const entry = {
          type: 'logData',
        };
        selectedElements = [...selectedElements, entry];
        sendResponse();
        break;
      default:
        console.error('Unrecognised message: ', message);
    }
  };

  contentScript.addMessageListener(handleMessage);
})();

(async () => {
  const src = chrome.runtime.getURL('priorityQueue.js');
  const { PriorityQueue } = await import(src);
  priorityQueue = new PriorityQueue();
})();

// This will only actually do something if the popup is open
// otherwise we just get an error in the console...
// In some cases the user may navigate to a new page after the popup is already open
// This handler is to make sure we add the necessary listeners back to the page
window.addEventListener('load', function (event) {
  chrome.runtime.sendMessage({ type: 'load' }, (response) => {});
});
