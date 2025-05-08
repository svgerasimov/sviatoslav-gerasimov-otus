export function displayTree(root) {
  // 1) печатаем корень без «веточки»
  console.log(root.name);

  // 2) рекурсивно выводим потомков
  function walk(node, prefix = '', isLast = true) {
    const connector = isLast ? '└── ' : '├── ';
    console.log(prefix + connector + node.name);

    const children = node.items ?? [];
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');

    children.forEach((child, i) =>
      walk(child, nextPrefix, i === children.length - 1)
    );
  }

  (root.items ?? []).forEach((child, i) =>
    walk(child, '', i === root.items.length - 1)
  );
}

const treeData = {
  name: '1',
  items: [
    { name: '2', items: [{ name: '3' }, { name: '4' }] },
    { name: '5', items: [{ name: '6' }] },
  ],
};
displayTree(treeData);
