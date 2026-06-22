import { Empty, Tree } from 'antd';
import { useElementTree } from '../hooks/useElementTree.js';

const { DirectoryTree } = Tree;

export default function TypesView() {
  const { treeData, selectedKeys, hasModel, selectElement } = useElementTree(['Struct']);

  if (!hasModel) {
    return (
      <div className="workbench-view">
        <Empty description="No model loaded" />
      </div>
    );
  }

  return (
    <div className="workbench-view">
      <DirectoryTree
        blockNode
        defaultExpandAll
        selectedKeys={selectedKeys}
        treeData={treeData}
        onSelect={(keys) => keys[0] && selectElement(keys[0])}
      />
    </div>
  );
}
