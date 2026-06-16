import ModelView from '../views/ModelView.jsx';
import SearchView from '../views/SearchView.jsx';
import DiagramView from '../views/DiagramView.jsx';
import MermaidView from '../views/MermaidView.jsx';
import IdlView from '../views/IdlView.jsx';
import QosXmlView from '../views/QosXmlView.jsx';
import ConsoleView from '../views/ConsoleView.jsx';
import OutputView from '../views/OutputView.jsx';
import MembersView from '../views/MembersView.jsx';
import PropertiesView from '../views/PropertiesView.jsx';
import QosView from '../views/QosView.jsx';

export const workbenchPanelsConfig = {
  panels: [
    {
      id: 'explorer',
      defaultSize: 300,
      min: 240,
      max: 480,
      defaultActiveView: 'model',
      views: [
        { id: 'model', label: 'Model', component: ModelView },
        { id: 'search', label: 'Search', component: SearchView },
      ],
    },
    {
      id: 'workspace',
      min: 520,
      defaultActiveView: 'diagram',
      views: [
        { id: 'diagram', label: 'Diagram', component: DiagramView },
        { id: 'mermaid', label: 'Mermaid', component: MermaidView },
        { id: 'idl', label: 'IDL', component: IdlView },
        { id: 'qosXml', label: 'QoS XML', component: QosXmlView },
      ],
    },
    {
      id: 'inspector',
      defaultSize: 390,
      min: 320,
      max: 560,
      defaultActiveView: 'properties',
      views: [
        { id: 'properties', label: 'Properties', component: PropertiesView },
        { id: 'members', label: 'Members', component: MembersView },
        { id: 'qos', label: 'QoS', component: QosView },
      ],
    },
    {
      id: 'bottom',
      defaultSize: 260,
      min: 160,
      max: 420,
      defaultActiveView: 'console',
      views: [
        { id: 'console', label: 'Console', component: ConsoleView },
        { id: 'output', label: 'Output', component: OutputView },
      ],
    },
  ],
};
