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

addListenersToBackgroundPage();