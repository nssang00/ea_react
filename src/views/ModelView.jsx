import { Empty, Tree } from 'antd';
import { useModelTree } from '../hooks/useModelTree.js';

const { DirectoryTree } = Tree;

export default function ModelView() {
  const { treeData, selectedKeys, hasModel, selectElement } = useModelTree();

  if (!hasModel) {
    return (
      <div className="workbench-view model-view">
        <Empty description="No model loaded" />
      </div>
    );
  }

  return (
    <div className="workbench-view model-view">
      <DirectoryTree
        blockNode
        defaultExpandAll
        selectedKeys={selectedKeys}
        treeData={treeData}
        onSelect={(selectedKeys) => {
          const selectedKey = selectedKeys[0];

          if (selectedKey) {
            selectElement(selectedKey);
          }
        }}
      />
    </div>
  );
}
