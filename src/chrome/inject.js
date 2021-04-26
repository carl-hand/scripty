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
    const { attributes = {} } = target;

    console.log(`vals ${event?.target.value}`);
  });
}

function findSelectedElement(target, eventType) {
  if (target.hasAttributes()) {
    const { attributes = {} } = target;
    let selectedName;
    let selectedValue;
    for (const key in attributes) {
      const entry = attributes[key];
      const { name, value } = entry;
      if (name && value) {
        // stop once we find first name value pair
        return {
          type: eventType,
          name: selectedName,
          value: selectedValue,
        };
      }
    }
  }

  return {
    type: 'No Match',
    value: target.innerHTML,
  };
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.type) {
    case 'getSelectedElements':
      sendResponse(selectedElements);
      break;
    default:
      console.error('Unrecognised message: ', message);
  }
});

addListenersToBackgroundPage();
