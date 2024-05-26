function displayTree(node, prefix = '', isLast = true) {
  const connector = isLast ? '└── ' : '├── ';
  console.log(prefix + connector + node.name);

  if (node.items && node.items.length > 0) {
    const newPrefix = prefix + (isLast ? '    ' : '│   ');

    node.items.forEach((childNode, index) => {
      displayTree(
        childNode,
        newPrefix,
        index === node.items.length - 1
      );
    });
  }
}

const treeData = {
  name: '1',
  items: [
    {
      name: '2',
      items: [{ name: '3' }, { name: '4' }],
    },
    {
      name: '5',
      items: [{ name: '6' }],
    },
  ],
};

displayTree(treeData);
