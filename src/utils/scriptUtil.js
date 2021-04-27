export function createScript(url, selectedElements) {
  let script = `logData 0 \nnavigate ${url}`;

  for (const element of selectedElements) {
    const { name, value, input } = element;
    if (element.type === 'click') {
      const newLine = `\nexec document.querySelector('[${name}="${value}"]').click()`;
      script += newLine;
    } else if (element.type === 'change') {
      const newLine = `\nexec document.querySelector('[${name}="${value}"]').value='${input}'`;
      script += newLine;
    } else if (element.type === 'logData') {
      script += '\nlogData 1';
    }
  }

  script += `\nnavigate ${url}`;
  script += '\nwaitForComplete';

  return script;
}