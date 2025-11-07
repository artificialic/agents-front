// @ts-nocheck
import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Plus, Minus } from 'lucide-react';
import { TrashIcon } from './icons';

interface NodeData extends Record<string, unknown> {
  label: string;
  prompt?: string;
  tools?: any[];
}

interface EdgeData {
  condition?: string;
  variables?: string;
}

type CustomNode = Node<NodeData>;
type CustomEdge = Edge<EdgeData>;

interface Llm {
  llm_id: string;
  version: number;
  is_published: boolean;
  model: string;
  s2s_model?: string;
  model_temperature: number;
  model_high_priority?: boolean;
  tool_call_strict_mode?: boolean;
  general_prompt?: string;
  general_tools?: {
    type: string;
    name: string;
    description: string;
  }[];
  states?: {
    name: string;
    state_prompt: string;
    edges?: {
      destination_state_name: string;
      description: string;
      speak_during_transition?: boolean;
      parameters?: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
      };
    }[];
    tools?: any[];
  }[];
  starting_state?: string;
  start_speaker?: 'user' | 'agent';
  begin_message?: string | null;
  begin_after_user_silence_ms?: number;
  default_dynamic_variables?: Record<string, string>;
  knowledge_base_ids?: string[];
  kb_config?: {
    top_k: number;
    filter_score: number;
  };
  last_modification_timestamp?: number;
  created_at?: string;
  updated_at?: string;
}

interface FlowEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  llm: Llm | null;
  onSave?: (updatedLlm: Llm) => void;
}

const statesToNodes = (states?: Llm['states'], startingState?: string): CustomNode[] => {
  if (!states || states.length === 0) {
    return [
      {
        id: '1',
        type: 'default',
        data: { label: '🤖 nuevo_estado_1' },
        position: { x: 250, y: 50 },
        style: {
          background: '#fff',
          border: '2px solid #ddd',
          borderRadius: '10px',
          padding: '20px',
          fontSize: '16px',
          fontWeight: '500'
        }
      }
    ];
  }

  return states.map((state, index) => {
    const isStartingState = state.name === startingState;
    return {
      id: state.name,
      type: 'default',
      data: {
        label: `${isStartingState ? '🚀 ' : '🤖 '}${state.name}`,
        prompt: state.state_prompt,
        tools: state.tools || []
      },
      position: { x: 250, y: index * 200 + 50 },
      style: {
        background: isStartingState ? '#f0fdf4' : '#fff',
        border: isStartingState ? '2px solid #22c55e' : '2px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        fontSize: '16px',
        fontWeight: '500'
      }
    };
  });
};

const statesToEdges = (states?: Llm['states']): CustomEdge[] => {
  if (!states) return [];

  const edges: CustomEdge[] = [];
  states.forEach((state) => {
    if (state.edges && state.edges.length > 0) {
      state.edges.forEach((edge, index) => {
        edges.push({
          id: `${state.name}-${edge.destination_state_name}-${index}`,
          source: state.name,
          target: edge.destination_state_name,
          label: 'Conexión',
          animated: true,
          style: { stroke: '#ccc', strokeWidth: 2 },
          data: {
            condition: edge.description || '',
            variables: edge.parameters ? JSON.stringify(edge.parameters, null, 2) : ''
          }
        });
      });
    }
  });

  return edges;
};

const nodesToStates = (nodes: CustomNode[], edges: CustomEdge[]): Llm['states'] => {
  return nodes.map((node) => {
    const nodeEdges = edges.filter((edge) => edge.source === node.id);

    return {
      name: node.id,
      state_prompt: node.data.prompt || '',
      edges: nodeEdges.map((edge) => {
        const edgeData: any = {
          destination_state_name: edge.target,
          description: edge.data?.condition || 'Conexión',
          speak_during_transition: false
        };

        if (edge.data?.variables) {
          try {
            const parsedVariables = JSON.parse(edge.data.variables);
            edgeData.parameters = parsedVariables;
          } catch (e) {
            console.error('Error parsing variables JSON:', e);
          }
        }

        return edgeData;
      }),
      tools: node.data.tools || []
    };
  });
};

export function FlowEditorModal({ open, onOpenChange, llm, onSave }: FlowEditorModalProps) {
  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const [edges, setEdges] = useState<CustomEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<CustomEdge | null>(null);
  const [nodeSheetOpen, setNodeSheetOpen] = useState(false);
  const [edgeSheetOpen, setEdgeSheetOpen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [nodePrompt, setNodePrompt] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [edgeCondition, setEdgeCondition] = useState('');
  const [edgeVariables, setEdgeVariables] = useState('');

  useEffect(() => {
    if (open && llm) {
      const initialNodes = statesToNodes(llm.states, llm.starting_state);
      const initialEdges = statesToEdges(llm.states);
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [open, llm]);

  useEffect(() => {
    if (selectedNode) {
      setNodePrompt(selectedNode.data.prompt || '');
      setEditedName(selectedNode.data.label.replace('🤖 ', '').replace('🚀 ', ''));
      setIsEditingName(false);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedEdge) {
      setEdgeCondition(selectedEdge.data?.condition || '');
      setEdgeVariables(selectedEdge.data?.variables || '');
    }
  }, [selectedEdge]);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );

  const onConnect = useCallback((params: any) => {
    const newEdge: CustomEdge = {
      ...params,
      id: `${params.source}-${params.target}-${Date.now()}`,
      label: 'Conexión',
      animated: true,
      style: { stroke: '#ccc', strokeWidth: 2 },
      data: {
        condition: '',
        variables: ''
      }
    };
    setEdges((edgesSnapshot) => [...edgesSnapshot, newEdge]);
  }, []);

  const onNodeClick = useCallback((_event: any, node: CustomNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setNodeSheetOpen(true);
    setEdgeSheetOpen(false);
  }, []);

  const onEdgeClick = useCallback((_event: any, edge: CustomEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setEdgeSheetOpen(true);
    setNodeSheetOpen(false);
  }, []);

  const deleteNode = () => {
    if (selectedNode) {
      setNodes((nodes) => nodes.filter((node) => node.id !== selectedNode.id));
      setEdges((edges) => edges.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
      setNodeSheetOpen(false);
      setSelectedNode(null);
    }
  };

  const deleteEdge = () => {
    if (selectedEdge) {
      setEdges((edges) => edges.filter((edge) => edge.id !== selectedEdge.id));
      setEdgeSheetOpen(false);
      setSelectedEdge(null);
    }
  };

  const addNewNode = () => {
    const newNodeName = `nuevo_estado_${nodes.length + 1}`;
    const newNode: CustomNode = {
      id: newNodeName,
      type: 'default',
      data: {
        label: `🤖 ${newNodeName}`,
        prompt: '',
        tools: []
      },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      style: {
        background: '#fff',
        border: '2px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        fontSize: '16px',
        fontWeight: '500'
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  };

  const handleSavePrompt = () => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id ? { ...node, data: { ...node.data, prompt: nodePrompt } } : node
        )
      );
    }
  };

  const handleStartEditingName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (selectedNode && editedName.trim() && editedName !== selectedNode.id) {
      const oldId = selectedNode.id;
      const newName = editedName.trim();
      const isStarting = selectedNode.data.label.startsWith('🚀');
      const newLabel = `${isStarting ? '🚀 ' : '🤖 '}${newName}`;

      setNodes((nds) =>
        nds.map((node) =>
          node.id === oldId ? { ...node, id: newName, data: { ...node.data, label: newLabel } } : node
        )
      );

      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          source: edge.source === oldId ? newName : edge.source,
          target: edge.target === oldId ? newName : edge.target,
          id: edge.id.replace(oldId, newName)
        }))
      );

      setSelectedNode((prev) => (prev ? { ...prev, id: newName, data: { ...prev.data, label: newLabel } } : null));

      setIsEditingName(false);
    }
  };

  const handleCancelEditingName = () => {
    if (selectedNode) {
      setEditedName(selectedNode.data.label.replace('🤖 ', '').replace('🚀 ', ''));
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEditingName();
    }
  };

  const handleSaveEdgeCondition = () => {
    if (selectedEdge) {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === selectedEdge.id ? { ...edge, data: { ...edge.data, condition: edgeCondition } } : edge
        )
      );
    }
  };

  const handleSaveEdgeVariables = () => {
    if (selectedEdge) {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === selectedEdge.id ? { ...edge, data: { ...edge.data, variables: edgeVariables } } : edge
        )
      );
    }
  };

  const formatJSON = () => {
    if (edgeVariables) {
      try {
        const parsed = JSON.parse(edgeVariables);
        const formatted = JSON.stringify(parsed, null, 2);
        setEdgeVariables(formatted);
      } catch (e) {
        alert('JSON inválido. Por favor corrige el formato.');
      }
    }
  };

  const handleSave = () => {
    if (!llm) return;

    const updatedStates = nodesToStates(nodes, edges);

    const updatedLlm: Llm = {
      ...llm,
      states: updatedStates,
      starting_state: nodes.length > 0 ? nodes[0].id : undefined,
      last_modification_timestamp: Date.now()
    };

    if (onSave) {
      onSave(updatedLlm);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-screen max-w-full p-0">
        <div className="relative h-full w-full">
          <div className="absolute left-5 top-5 z-10 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-12 w-12 rounded-xl bg-white shadow-md"
            >
              <X className="h-5 w-5" />
            </Button>

            <Button className="rounded-xl px-6 py-3 shadow-md" onClick={handleSave}>
              Guardar
            </Button>
          </div>

          <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
            <Button onClick={addNewNode} className="rounded-xl px-7 py-6 shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Estado
            </Button>

            <Button
              onClick={handleZoomIn}
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-xl bg-white shadow-md"
            >
              <Plus className="h-6 w-6" />
            </Button>

            <Button
              onClick={handleZoomOut}
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-xl bg-white shadow-md"
            >
              <Minus className="h-6 w-6" />
            </Button>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onInit={setReactFlowInstance}
            fitView
            className="h-full w-full"
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>

          <Sheet open={nodeSheetOpen} onOpenChange={setNodeSheetOpen}>
            <SheetContent className="w-[550px] overflow-y-auto sm:w-[550px] [&>button]:hidden">
              {selectedNode && (
                <>
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isEditingName ? (
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={handleSaveName}
                            onKeyDown={handleNameKeyDown}
                            className="rounded border border-blue-500 px-2 py-1 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <>
                            <SheetTitle className="text-lg font-medium">
                              {selectedNode.data.label.replace('🤖 ', '').replace('🚀 ', '')}
                            </SheetTitle>
                            <button
                              className="p-1 text-gray-400 transition-colors hover:text-gray-600"
                              onClick={handleStartEditingName}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M5.23023 11.7L12.0761 4.85415L11.1216 3.8997L4.27578 10.7455V11.7H5.23023ZM5.78981 13.05H2.92578V10.186L10.6444 2.46735C10.771 2.3408 10.9426 2.26971 11.1216 2.26971C11.3006 2.26971 11.4723 2.3408 11.5989 2.46735L13.5084 4.37692C13.635 4.5035 13.7061 4.67516 13.7061 4.85415C13.7061 5.03313 13.635 5.20479 13.5084 5.33137L5.78981 13.05ZM2.92578 14.4H15.0758V15.75H2.92578V14.4Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                      <button
                        onClick={deleteNode}
                        className="p-2 text-gray-400 transition-colors hover:text-red-600"
                        aria-label="Eliminar"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <hr className="border-gray-200" />
                  </SheetHeader>

                  <div className="mt-8 space-y-8">
                    <div className="space-y-4">
                      <div>
                        <h3 className="mb-2 text-lg font-bold text-gray-900">Prompt</h3>
                        <p className="text-sm leading-relaxed text-gray-600">
                          Lee las{' '}
                          <a href="#" className="font-medium text-blue-500 hover:underline">
                            mejores prácticas de agentes multi-prompt con estado
                          </a>
                          .
                        </p>
                      </div>
                      <Textarea
                        value={nodePrompt}
                        onChange={(e) => setNodePrompt(e.target.value)}
                        onBlur={handleSavePrompt}
                        placeholder="Ingresa parte de tu prompt aquí, por ejemplo: 'Haz una lista de preguntas para hacerle al usuario: [Pregunta 1] [Pregunta 2] [Pregunta 3] [Pregunta 4]'"
                        className="min-h-[350px] resize-y rounded-lg border-2 border-blue-500 focus:border-blue-600"
                      />
                    </div>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>

          <Sheet open={edgeSheetOpen} onOpenChange={setEdgeSheetOpen}>
            <SheetContent className="w-[550px] overflow-y-auto sm:w-[550px] [&>button]:hidden">
              {selectedEdge && (
                <>
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <SheetTitle className="text-lg font-medium">Conexión del agente</SheetTitle>
                      <button
                        onClick={deleteEdge}
                        className="p-2 text-gray-400 transition-colors hover:text-red-600"
                        aria-label="Eliminar"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <hr className="border-gray-200" />
                  </SheetHeader>

                  <div className="mt-8 space-y-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-900">Condición de Ruta</Label>
                        <p className="mt-1 text-xs text-gray-600">
                          Describe la condición que activa la transición al siguiente estado
                        </p>
                      </div>
                      <Input
                        value={edgeCondition}
                        onChange={(e) => setEdgeCondition(e.target.value)}
                        onBlur={handleSaveEdgeCondition}
                        placeholder='La condición que activa la transición al siguiente estado. ej., "Si el usuario ha proporcionado el nombre"'
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-900">
                          Guardar Información de Llamada como Variables (Opcional)
                        </Label>
                        <p className="mt-1 text-xs text-gray-600">
                          Convierte información del nodo anterior en variables para usar en nodos futuros. Este debe ser
                          el esquema JSON que define el formato en el que el LLM devolverá.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Textarea
                          value={edgeVariables}
                          onChange={(e) => setEdgeVariables(e.target.value)}
                          onBlur={handleSaveEdgeVariables}
                          placeholder="Ingresa el esquema JSON aquí..."
                          className="min-h-[250px] resize-y rounded-lg bg-gray-50 font-mono text-sm"
                        />

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={formatJSON} className="text-xs">
                            Formatear JSON
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </DialogContent>
    </Dialog>
  );
}
