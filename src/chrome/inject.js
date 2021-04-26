/*global chrome*/

let attributesMap;

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
    event.stopPropagation();
    const { target } = event;
    const { attributes = {} } = target;

    console.log(JSON.stringify(attributes));
    // do I want to log all attributes on the element? maybe just the first one
    const latestAttributesMap = Object.keys(attributes).map((key) => {
      const object = attributes[key];
      const { name, value } = object;
      return { type: 'click', name, value };
    });

    console.log(typeof latestAttributesMap);

    attributesMap = { ...attributesMap, ...latestAttributesMap };
    // console.log(`attributesMap: ${JSON.stringify(attributesMap)}`);
  });

  document.addEventListener('change', (event) => {
    const { target } = event;
    const { attributes = {} } = target;

    attributesMap = { ...attributesMap };
    console.log(`vals ${event?.target.value}`);
  });
}

addListenersToBackgroundPage();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.type) {
    case 'getSelectedElements':
      sendResponse(attributesMap);
      break;
    default:
      console.error('Unrecognised message: ', message);
  }
});
