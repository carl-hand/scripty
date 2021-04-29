export class PriorityQueue {
  items;
  count;
  CLASS_PRIORITY = 9999;

  constructor() {
    this.items = [];
    this.count = 0;
  }

  insert(item) {
    // insert at last position
    // while current items priority < parent items priority
    // swap child with parent
    const priority = this.findPriority(item);
    const entry = { ...item, priority };
    let childIndex = this.count++;
    this.items[childIndex] = entry;
    while (
      childIndex > 0 &&
      entry.priority < this.items[this.getParentIndex(childIndex)].priority
    ) {
      let parentIndex = this.getParentIndex(childIndex);
      const temp = this.items[childIndex];
      this.items[childIndex] = this.items[parentIndex];
      this.items[parentIndex] = temp;

      childIndex = parentIndex;
      parentIndex = this.getParentIndex(childIndex);
    }
  }

  findPriority(item) {
    const { name } = item;
    if (name.indexOf('test') !== -1) {
      return 0;
    } else if (name.indexOf('id') !== -1) {
      return 1;
    } else if (name === 'title') {
      return 2;
    } else if (name === 'href') {
      return 3;
    } else if (name === 'src') {
      return 4;
    } else if (name === 'alt') {
      return 5;
    } else if (name !== 'class') {
      // for attributes not listed here that I can't think of...
      return 6;
    }

    return this.CLASS_PRIORITY;
  }

  getParentIndex(childIndex) {
    return Math.abs(Math.ceil(childIndex / 2 - 1));
  }

  isEmpty() {
    return this.items.length === 0;
  }

  getAttribute() {
    return this.items?.[0];
  }

  clear() {
    this.count = 0;
    this.items = [];
  }
}
