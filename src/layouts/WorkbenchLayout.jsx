import { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Splitter } from 'antd';
import { useEnsureProjectModel } from '../hooks/useEnsureProjectModel.js';
import { useProjects } from '../hooks/useProjects.js';
import { workbenchPanelsConfig } from './workbenchPanels.config.js';
import WorkbenchPanelRenderer from './WorkbenchPanelRenderer.jsx';

export default function WorkbenchLayout() {
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
  const { currentProject } = useProjects();
  useEnsureProjectModel(currentProject?.id ?? 'project-vehicle');

  const [explorerPanel, workspacePanel, inspectorPanel, bottomPanel] = workbenchPanelsConfig.panels;

  return (
    <Splitter className="workbench-layout">
      <Splitter.Panel
        defaultSize={explorerPanel.defaultSize}
        min={explorerPanel.min}
        max={explorerPanel.max}
        className="workbench-layout__explorer"
      >
        <WorkbenchPanelRenderer panel={explorerPanel} />
      </Splitter.Panel>

      <Splitter.Panel min={workspacePanel.min + inspectorPanel.min}>
        <div className="workbench-main-stack">
          <Splitter layout="vertical" className="workbench-main-splitter">
            <Splitter.Panel min={360}>
              <Splitter className="workbench-main-content">
                <Splitter.Panel
                  min={workspacePanel.min}
                  className="workbench-layout__workspace"
                >
                  <WorkbenchPanelRenderer panel={workspacePanel} />
                </Splitter.Panel>

                <Splitter.Panel
                  defaultSize={inspectorPanel.defaultSize}
                  min={inspectorPanel.min}
                  max={inspectorPanel.max}
                  className="workbench-layout__inspector"
                >
                  <WorkbenchPanelRenderer panel={inspectorPanel} />
                </Splitter.Panel>
              </Splitter>
            </Splitter.Panel>

            {isBottomPanelOpen && (
              <Splitter.Panel
                defaultSize={bottomPanel.defaultSize}
                min={bottomPanel.min}
                max={bottomPanel.max}
                className="workbench-layout__bottom"
              >
                <div className="bottom-panel-frame">
                  <div className="bottom-panel-handle bottom-panel-handle--open">
                    <Button
                      className="bottom-panel-handle-button"
                      type="text"
                      size="small"
                      icon={<DownOutlined />}
                      aria-label="Close output panel"
                      onClick={() => setIsBottomPanelOpen(false)}
                    />
                  </div>
                  <WorkbenchPanelRenderer panel={bottomPanel} />
                </div>
              </Splitter.Panel>
            )}
          </Splitter>

          {!isBottomPanelOpen && (
            <div className="bottom-panel-dock">
              <div className="bottom-panel-handle bottom-panel-handle--closed">
                <Button
                  className="bottom-panel-handle-button"
                  type="text"
                  size="small"
                  icon={<UpOutlined />}
                  aria-label="Open output panel"
                  onClick={() => setIsBottomPanelOpen(true)}
                />
              </div>
            </div>
          )}
        </div>
      </Splitter.Panel>
    </Splitter>
  );
}
