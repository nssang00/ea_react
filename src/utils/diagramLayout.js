const GAP = 36;

export function avoidNodeOverlaps(nodes) {
  const fixed = nodes.filter((node) => node.data?.isContainer);
  const movable = nodes
    .filter((node) => !node.data?.isContainer)
    .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
  const placed = [];

  const positioned = movable.map((node) => {
    const next = { ...node, position: { ...node.position } };
    let collision;
    while ((collision = placed.find((item) => overlaps(next, item)))) {
      next.position.y = collision.position.y + nodeHeight(collision) + GAP;
    }
    placed.push(next);
    return next;
  });

  return [...fixed, ...positioned];
}

function overlaps(a, b) {
  return a.position.x < b.position.x + nodeWidth(b) + GAP
    && a.position.x + nodeWidth(a) + GAP > b.position.x
    && a.position.y < b.position.y + nodeHeight(b) + GAP
    && a.position.y + nodeHeight(a) + GAP > b.position.y;
}

function nodeWidth(node) { return node.width ?? 170; }
function nodeHeight(node) { return node.height ?? 68; }
