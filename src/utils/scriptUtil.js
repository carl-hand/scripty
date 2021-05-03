export function createScript(url, selectedElements) {
  if (!selectedElements) {
    return 'Oops something went wrong';
  }

  let script = `logData 0 \nnavigate ${url}`;
  for (const element of selectedElements) {
    const { type, name, value, input } = element;
    if (type === 'click') {
      const newLine = `\nexec document.querySelector('[${name}="${value}"]').click()`;
      script += newLine;
    } else if (type === 'change') {
      const newLine = `\nexec document.querySelector('[${name}="${value}"]').value='${input}'`;
      script += newLine;
    } else if (type === 'form') {
      const newLine = `\nexec document.querySelector('[${name}="${value}"]').form.submit()`;
      script += newLine;
    } else if (type === 'logData') {
      script += '\nlogData 1';
    }
  }

  script += `\nnavigate ${url}`;
  script += '\nwaitForComplete';

  return script;
}
